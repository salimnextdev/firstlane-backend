import { UserInvestmentStatus } from "@app/enum";
import {
  WalletModel,
  WalletDoc,
  UserDoc,
  UserModel,
  UserInvestmentModel,
  UserInvestmentDoc,
} from "@app/schema";
import {
  NotificationService,
  ObjectReturnType,
  serviceResponse,
  WebSocketGatewayService,
} from "@app/service";
import { FlutterwaveService } from "@app/service/shared/payment/flutterwave";
import { Injectable, Logger, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
const transferCompleted = {
  event: "transfer.completed",
  "event.type": "Transfer",
  data: {
    id: 33286,
    account_number: "0690000033",
    bank_name: "ACCESS BANK NIGERIA",
    bank_code: "044",
    fullname: "Bale Gary",
    created_at: "2020-04-14T16:39:17.000Z",
    currency: "NGN",
    debit_currency: "NGN",
    amount: 30020,
    fee: 26.875,
    status: "SUCCESSFUL",
    reference: "a0a827b1eca65311_PMCKDU_5",
    meta: null,
    narration: "lolololo",
    approver: null,
    complete_message: "Successful",
    requires_approval: 0,
    is_approved: 1,
  },
};
@Injectable()
export class WalletService {
  constructor(
    private flutterwaveService: FlutterwaveService,
    private notificationActivity: NotificationService,
    private webSockekGatwaySerrvice: WebSocketGatewayService,

    @InjectModel(WalletModel.name) private walletModel: Model<WalletDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>
  ) {}
  private readonly logger = new Logger(WalletService.name);
  async flutterwaveWebhook(req: any): Promise<any> {
    try {
      const data = (await this.flutterwaveService.handleWebhook(
        req
      )) as typeof transferCompleted;
      console.log(data);
      this.logger.log(data);
      const reference = data?.data?.reference?.split("_");
      const ref = reference[0];
      const ref2 = reference[1];
      if (ref) {
        const user = await this.userModel.findOne({
          id: ref,
        });
        const userInvest = await this.userInvestmentModel.findOneAndUpdate(
          {
            id: ref2,
          },
          {
            status: UserInvestmentStatus.ACTIVE,
          },
          { new: true }
        );

        if (user) {
          this.notificationActivity.notificationActivity({
            entityType: ref2 ? UserInvestmentModel.name : this.userModel.name,
            userID: user._id.toString(),
            details: `${data["event.type"]} ${data.data.complete_message}`,
            action: data.event,
            entityID: userInvest?._id.toString() ?? user?._id.toString(),
            playerIds: [user._id.toString()],
          });

          this.webSockekGatwaySerrvice.walletNotification({
            data,
            userID: user._id.toString(),
          });
        }
      }

      return serviceResponse({
        status: true,
        message: "Webhook processed successfully",
        data: data,
      });
    } catch (error) {
      this.logger.error("Error handling Flutterwave webhook:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
  //test deposite
  async testDeposit(data: {
    account_reference: string;
    amount: number;
  }): Promise<ObjectReturnType> {
    const { account_reference, amount } = data;
    try {
      const res = await this.flutterwaveService.testDeposit({
        account_reference,
        amount,
      });
      return serviceResponse({
        data: res.data,
        status: true,
        message: "Wallet funded successfully",
      });
    } catch (error) {
      console.error(
        "Error performing wallet to wallet transfer:",
        error.response?.data || error.message
      );
      throw new NotAcceptableException(
        error.response?.data.message || error.message
      );
    }
  }
  async createVirtualAccount(userData: {
    account_name: string;
    email: string;
    mobilenumber: string;
  }) {
    try {
      const res = await this.flutterwaveService.createVirtualAccount(userData);
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error creating virtual account:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
  // getAvailableBalance
  async getAvailableBalance(userID: string): Promise<any> {
    try {
      const res = await this.flutterwaveService.getAvailableBalance(userID);
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error fetching available balance:", error);
      throw new NotAcceptableException(error?.message);
    }
  }

  async verifyAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await this.flutterwaveService.verifyAccountNumber(
        accountNumber,
        bankCode
      );
      return serviceResponse({
        status: true,
        message: "Success",
        data: response.data,
      });
    } catch (error) {
      this.logger.error("Error verifying account number:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
  // fetchTransactions
  async fetchTransactions(data: {
    subaccountId: string;
    from: string;
    to: string;
    perPage?: number;
    page?: number;
  }): Promise<any> {
    try {
      const res = await this.flutterwaveService.fetchTransactions(data);
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error fetching transactions:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
  // get all banks
  async getAllBanks(): Promise<any> {
    try {
      const res = await this.flutterwaveService.getAllBanks();
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error fetching banks:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
  //walletToWalletTransfer
  async walletToWalletTransfer(data: {
    account_number: string;
    amount: number;
    narration: string;
    reference: string;
    currency: string;
    debit_subaccount: string;
    callback_url: string;
    debit_currency: string;
  }): Promise<any> {
    const {
      account_number,
      amount,
      narration,
      reference,
      currency,
      debit_subaccount,
      callback_url,
      debit_currency,
    } = data;
    try {
      const res = await this.flutterwaveService.walletToWalletTransfer({
        account_bank: "flutterwave",
        account_number,
        amount,
        narration,
        reference,
        debit_subaccount,
      });
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error performing wallet to wallet transfer:", error);
      throw new NotAcceptableException(error?.message);
    }
  }
}
