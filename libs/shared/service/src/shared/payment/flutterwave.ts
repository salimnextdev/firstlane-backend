import { UserModel, UserDoc, RideModel, RideDoc } from "@app/schema";
import {
  TransactionModel,
  TransactionDoc,
} from "@app/schema";
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
    this.secretHash = this.configService.get<string>("FLUTTERWAVEEncryptionKey");
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
    if (!signature || (signature !== this.secretHash)) {
        // This request isn't from Flutterwave; discard
        throw new Error("Failed to process webhook");
    }
    return req.body 
    
      return { status: "success", message: "Webhook processed successfully" };
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw new Error("Failed to process webhook");
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
      throw error;
    }
  }


  //create wallet for users
  async createVirtualAccount(data: {
    account_name: string;
    email: string;
    mobilenumber: string;
  }): Promise<any> {
    const { account_name, email = "", mobilenumber } = data;
    try {
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
      const responseType = response.data as typeof CreateSubaccount;

      const user = await this.userModel.findOne({ email });

      await this.walletModel.create({
        accountNumber: responseType.data.nuban,
        accountName: account_name,
        userID: user?._id.toString(),
        barter_id: responseType.data.barter_id,
        bankCode: responseType.data.bank_code,
        bankName: responseType.data.bank_name,
        customerCode: responseType.data.account_reference,
        currency: "NGN",
      });
      return responseType;
    } catch (error) {
      console.error(
        "Error creating virtual account:",
        error.response?.data || error.message
      );
      throw error;
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
          reference:reference,
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
      throw error;
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
          reference:reference,
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
      throw error;
    }
  }

  //fetch available balance on a payout subaccount.
  async getAvailableBalance(userID: string): Promise<any> {
    const wallet = await this.walletModel.findOne({
      userID
    });
    if(!wallet){
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
      return {data:{...response.data.data,wallet}};
    } catch (error) {
      console.error(
        "Error fetching available balance:",
        error.response?.data || error.message
      );
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      console.error("Error fetching banks:", error.response?.data || error.message);
      throw error;
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
