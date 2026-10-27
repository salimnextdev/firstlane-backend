import { UserModel, UserDoc, RideModel, RideDoc } from "@app/schema";
import { TransactionModel, TransactionDoc } from "@app/schema";
import { WalletModel, WalletDoc } from "@app/schema";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { randomInt, randomUUID } from "crypto";
import { Model } from "mongoose";

@Injectable()
export class FlutterwaveService {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly secretHash: string;

  private readonly headers: any;
  constructor(
    private configService: ConfigService,
    @InjectModel(WalletModel.name) private walletModel: Model<WalletDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>
  ) {
    this.baseUrl = "";
    this.secretKey = this.configService.get<string>("FLUTTERWAVE_SECRET_KEY");
    this.secretHash = this.configService.get<string>(
      "FLUTTERWAVEEncryptionKey"
    );
    this.headers = {
      accept: "application/json",
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  //webhook
  async handleWebhook(req: any): Promise<any> {
    try {
      const signature = req.headers["verif-hash"];
      if (!signature || signature !== this.secretHash) {
        // This request isn't from Flutterwave; discard
        throw new Error("Failed to process webhook");
      }
      return req.body;

      return { status: "success", message: "Webhook processed successfully" };
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw new Error("Failed to process webhook");
    }
  }

  async initiateCheckout(data: {
    tx_ref: string;
    amount: number;
    currency: string;
    redirect_url: string;
    payment_options?: string;
    meta?: any;
    customer: {
      email: string;
      phonenumber?: string;
      name?: string;
    };
    customizations?: {
      title?: string;
      logo?: string;
      description?: string;
    };
    // You can include other optional fields like meta, customer name, etc.
  }): Promise<any> {
    try {
      const options = {
        method: "POST",
        url: "https://api.flutterwave.com/v3/payments",
        headers: this.headers,
        data,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error initiating checkout:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  /**
   * Verify a checkout / transaction after payment
   * (Using the same verify endpoint you already planned)
   */
  async verifyCheckout(tx_ref: string): Promise<any> {
    try {
      const options = {
        method: "GET",
        url: `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
        headers: this.headers,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      throw error.response?.data.response?.data;
    }
  }

  //test deposit
  async testDeposit(data: {
    account_reference: string;
    amount: number;
  }): Promise<any> {
    const { account_reference, amount } = data;
    try {
      const options = {
        method: "POST",
        url: `https://api.flutterwave.com/v3/payout-subaccounts/${account_reference}/fund-account`,
        headers: this.headers,
        data: {
          amount,
          currency: "NGN",
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error performing wallet to wallet transfer:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  //create wallet for users
  async createVirtualAccount(data: {
    account_name: string;
    email: string;
    mobilenumber: string;
  }) {
    let { account_name, email = "", mobilenumber } = data;
    account_name = account_name;
    mobilenumber = mobilenumber;
    email = email.toLowerCase();
    try {
      //check if user exists in fultterwave
      const response = await axios.request({
        method: "GET",
        url: `https://api.flutterwave.com/v3/payout-subaccounts?email=${email}`,
        headers: this.headers,
      });
      let responseType = response.data.data[0];
      console.log(responseType);
      if (responseType) {
      } else {
        const options = {
          method: "POST",
          url: "https://api.flutterwave.com/v3/payout-subaccounts",
          headers: this.headers,
          data: {
            account_name,
            email,
            mobilenumber,
            country: "NG",
          },
        };
        const response = await axios.request(options);
        responseType = response.data.data as typeof CreateSubaccount.data;
      }

      const user = await this.userModel.findOne({ email });

      await this.walletModel.create({
        accountNumber: responseType.nuban,
        accountName: account_name,
        userID: user?._id.toString(),
        email,
        barter_id: responseType.barter_id,
        bankCode: responseType.bank_code,
        bankName: responseType.bank_name,
        customerCode: responseType.account_reference,
        currency: "NGN",
      });
      return responseType;
    } catch (error) {
      if ((error.response?.data.message as string).includes("exist")) {
      } else {
        throw error.response?.data;
      }
    }
  }
  // wallet-to-wallet transfers
  async walletToWalletTransfer(data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    reference?: string;
    debit_subaccount?: string;
  }): Promise<any> {
    const {
      account_bank,
      account_number,
      amount,

      narration,
      reference,
      debit_subaccount,
    } = data;
    try {
      const options = {
        method: "POST",
        url: "https://api.flutterwave.com/v3/transfers",
        headers: this.headers,
        data: {
          account_bank,
          account_number,
          amount,
          currency: "NGN",
          debit_currency: "NGN",
          narration,
          reference: reference,
          debit_subaccount,
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error performing wallet to wallet transfer:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  //Withdraw funds from a user's wallet.
  async withdrawFunds(data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    reference?: string;
    debit_subaccount?: string;
  }): Promise<any> {
    const {
      account_bank,
      account_number,
      amount,
      narration,
      reference,
      debit_subaccount,
    } = data;
    try {
      const options = {
        method: "POST",
        url: "https://api.flutterwave.com/v3/transfers",
        headers: this.headers,
        data: {
          account_bank,
          account_number,
          amount,
          currency: "NGN",
          narration,
          reference: reference,
          debit_subaccount,
          callback_url: "https://www.flutterwave.com/ng/",
          debit_currency: "NGN",
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error withdrawing funds:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  //fetch available balance on a payout subaccount.
  async getAvailableBalance(userID: string): Promise<any> {
    const wallet = await this.walletModel.findOne({
      userID,
    });
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const subaccountId = wallet.customerCode;
    try {
      const options = {
        method: "GET",
        url: `https://api.flutterwave.com/v3/payout-subaccounts/${subaccountId}/balances`,
        headers: this.headers,
      };
      const response = await axios.request(options);
      console.log(response.data);
      return { data: { ...response.data.data, wallet } };
    } catch (error) {
      console.error(
        "Error fetching available balance:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  // Fetch Transactions\
  async fetchTransactions(data: {
    subaccountId: string;
    from: string;
    to: string;
    fetch_limit?: number;
    page?: number;
  }): Promise<any> {
    const { subaccountId, from, to, fetch_limit = 10, page = 1 } = data;
    try {
      const options = {
        method: "GET",
        url: `https://api.flutterwave.com/v3/payout-subaccounts/${subaccountId}/transactions?from=${from}&to=${to}&currency=NGN&page=${page}&fetch_limit=${fetch_limit}`,
        headers: this.headers,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  // Get a transfer by ID
  async getTransferById(transferId: string): Promise<any> {
    try {
      const options = {
        method: "GET",
        url: `https://api.flutterwave.com/v3/transfers/${transferId}`,
        headers: this.headers,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transfer by ID:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  // Verify a bank account number
  async verifyAccountNumber(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    try {
      const options = {
        method: "POST",
        url: "https://api.flutterwave.com/v3/accounts/resolve",
        headers: this.headers,
        data: {
          account_number: accountNumber,
          account_bank: bankCode,
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error verifying account number:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }

  //Get all banks

  async getAllBanks(): Promise<any> {
    try {
      const options = {
        method: "GET",
        url: "https://api.flutterwave.com/v3/banks/NG",
        headers: this.headers,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching banks:",
        error.response?.data || error.message
      );
      throw error.response?.data;
    }
  }
}

const CreateSubaccount = {
  status: "success",
  message: "Payout subaccount created",
  data: {
    id: 1276,
    account_reference: "PSAC1*****2705732",
    account_name: "John Doe",
    barter_id: "234101019871322",
    email: "johndoe@example.com",
    mobilenumber: "01010100101",
    country: "US",
    nuban: "822*****903",
    bank_name: "Sterling Bank PLC",
    bank_code: "232",
    status: "ACTIVE",
    created_at: "2021-10-04T18:38:25.000Z",
  },
};
