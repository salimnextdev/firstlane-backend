import { UserDTO } from "@app/dto";
import {
  TransactionStatus,
  TransactionType,
  UserInvestmentStatus,
} from "@app/enum";
import {
  WalletModel,
  WalletDoc,
  UserDoc,
  UserModel,
  UserInvestmentModel,
  UserInvestmentDoc,
  OTPDoc,
  OTPModel,
  TransactionModel,
  TransactionDoc,
} from "@app/schema";
import {
  getMetadata,
  NotificationService,
  ObjectReturnType,
  serviceResponse,
  WebSocketGatewayService,
  TransactionNotificationService,
} from "@app/service";
import { FlutterwaveService } from "@app/service/shared/payment/flutterwave";
import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
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
    private transactionNotificationService: TransactionNotificationService,

    @InjectModel(WalletModel.name) private walletModel: Model<WalletDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    @InjectModel(OTPModel.name) private otpModel: Model<OTPDoc>,
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
    userID: string;
    amount: number;
  }): Promise<ObjectReturnType> {
    const { userID, amount } = data;
    const wallet = await this.walletModel.findOne({ userID });
    console.log(wallet, userID);

    try {
      const res = await this.flutterwaveService.testDeposit({
        account_reference: wallet.customerCode,
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
      this.logger.error(
        "Error creating virtual account:",
        error.response?.data.message || error.message
      );
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
    userID: string;
    from: string;
    to: string;
    perPage?: number;
    page?: number;
  }): Promise<ObjectReturnType> {
    try {
      const wallet = await this.walletModel.findOne({ userID: data.userID });
      if (!wallet) {
        return serviceResponse({
          status: false,
          message: "Wallet not found",
        });
      }
      const res = await this.flutterwaveService.fetchTransactions({
        subaccountId: wallet.customerCode,
        from: data.from,
        to: data.to,

        fetch_limit: data.perPage,
        page: data.page,
      });
      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error fetching transactions:", error);
      throw new NotAcceptableException(
        error?.response?.data?.message || error?.message
      );
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
      // const transaction = await this.transactionModel.create({
      //   userID: userData._id.toString(),
      //   amount,
      //   reference: res?.response?.data?.reference,
      //   type: TransactionType.DEPOSIT,
      //   status: TransactionStatus.PAID,
      //   receiverBank: res?.response?.data?.bank_name,
      //   receiverAccountNumber: account_number,
      //   senderBank: wallet.bankName,
      //   senderAccountNumber: wallet.accountNumber,
      // });
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

  async withdrawFunds(data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    userID: string;
    otp: string;
  }): Promise<any> {
    try {
      const otpA = await this.otpModel.findOne({
        code: data.otp,
        type: "Withdrawal",
        userID: data.userID,
      });
      if (!otpA) {
        throw new NotFoundException("OTP not found");
      }
      const user = await this.userModel.findById(data.userID);
      const wallet = await this.walletModel.findOne({
        userID: user._id.toString(),
      });
      if (!wallet) {
        throw new NotFoundException("User not found");
      }
      const ref= user.id +`_withdrawal-` +
          randomInt(99999) +
          randomUUID().replace(/\D/g, "").substring(0, 2)


    const wallet2 = await this.flutterwaveService.getAvailableBalance(
        user._id.toString()
      );
      if ((wallet2?.data?.available_balance ?? 0) < data.amount) {
        throw new Error("Insufficient balance");
      }
      const res = await this.flutterwaveService.withdrawFunds({
        ...data,
        reference:ref,
          
         
        debit_subaccount: wallet.customerCode,
      });
      const transaction = await this.transactionModel.create({
        userID: user._id.toString(),
        amount:data.amount,
        reference: res?.response?.data?.reference??ref,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PAID,
        receiverBank: data.account_bank,
        receiverAccountNumber: data.account_number,
        senderBank: wallet.bankName,
        senderAccountNumber: wallet.accountNumber,
      });

      // Send transaction notifications
      await this.transactionNotificationService.sendTransactionNotifications({
        type: TransactionType.WITHDRAWAL,
        amount: data.amount,

        userID: user._id.toString(),
        reference: res?.response?.data?.reference,
        status: TransactionStatus.PAID,
      });

      return serviceResponse({
        status: true,
        message: res.message,
        data: res.data,
      });
    } catch (error) {
      this.logger.error("Error withdrawing funds:", error);
      throw new NotAcceptableException(error?.message);
    }
  }

 async findAll(query: any): Promise<ObjectReturnType> {
     const { limit = 10, page = 1 } = query;
     const skip = (page - 1) * limit;
 
     const plans = await this.transactionModel
       .find()
       .skip(skip)
       .limit(limit)
       .sort({ createdAt: -1 })
       .exec();
     return serviceResponse({
       data: plans,
       message: "Transactions retrieved successfully",
       status: true,
       metadata: await getMetadata({
         model: this.transactionModel,
         query,
         querys: {},
       }),
     });
   }

   //find by any
  async findByAny(
    params: { key: string; value: string },
    query: any
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.transactionModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Transaction retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.transactionModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  // initiateCheckout
  async initiateCheckout(userData: UserDTO, paymentRequest: PaymentRequestDTO) {
    const paymentrequest = {
      amount: paymentRequest.amount,
      currency: "NGN",
      tx_ref: `${userData._id.toString()}-${Date.now()}`,
      redirect_url: paymentRequest.redirect_url,
      payment_options: "card,banktransfer,ussd",
      customer: {
        phonenumber: userData.phone,
        name: userData.fullname ?? userData.username ?? userData.firstname,
        email: userData.email,
      },
      customizations: {
        title: "First lane",
        logo: "https://first.vercel.app/logo.png",
        description: "Fund account",
      },
    };
    const wallet = await this.walletModel.findOne({
      userID: userData._id.toString(),
    });
    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }
    const payment = await this.flutterwaveService.initiateCheckout(
      paymentrequest
    );
    const transaction = await this.transactionModel.create({
      userID: userData._id.toString(),
      amount: paymentrequest.amount,
      reference: paymentrequest.tx_ref,
      type: TransactionType.DEPOSIT,
      receiverBank: wallet.bankName,

      receiverAccountNumber: wallet.accountNumber,
    });

    console.log(paymentrequest);
    return serviceResponse({
      data: {
        link: payment.data.link,
        ...transaction.toObject(),
      },
      message: "successfully",

      status: true,
    });
  }

  //verify payment
  async verifyCheckout(ref: string) {
    try {
      const transaction = await this.transactionModel.findOne({
        reference: ref,
      });
      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }
      if (transaction.status === TransactionStatus.PAID) {
        throw new NotAcceptableException("Transaction already verified");
      }
     
      const v = await this.flutterwaveService.verifyCheckout(ref);

      if (v.data.status === "successful") {
        const admin = await this.userModel.findOne({
          isSuperAdmin: true,
        });
        const adminWallet = await this.walletModel.findOne({
          userID: admin._id.toString(),
        });
        const userWallet = await this.walletModel.findOne({
          userID: transaction.userID,
        });
        const wallet = await this.flutterwaveService.getAvailableBalance(
        admin._id.toString()
      );
      console.log(wallet?.data, transaction.amount)
      if ((wallet?.data?.available_balance ?? 0) < transaction.amount) {
        throw new Error("Insufficient balance");
      }
       await this.flutterwaveService.walletToWalletTransfer({
          account_bank: "flutterwave",
          account_number: userWallet.barter_id,
          amount: transaction.amount,
          narration: `Deposited`,
          reference: `${transaction._id}_${Date.now()}`,
          debit_subaccount: adminWallet.customerCode,
        });

         transaction.senderBank = adminWallet.bankName;
      transaction.senderAccountNumber = adminWallet.accountNumber;
      }
     
      transaction.status =
        v.data.status === "successful"
          ? TransactionStatus.PAID
          : v.data === "pending"
          ? TransactionStatus.PENDING
          : TransactionStatus.CANCELLED;
      await transaction.save();

      // Send transaction notifications for successful deposits
      if (transaction.status === TransactionStatus.PAID) {
        await this.transactionNotificationService.sendTransactionNotifications({
          type: transaction.type as TransactionType,
          amount: transaction.amount,
          userID: transaction.userID,
          reference: transaction.reference,
          status: transaction.status,
        });
      }

      return serviceResponse({
        message: "  ",
        data: v.data,
        status: true,
      });
    } catch (error) {
      this.logger.error("Error fetching transfer by ID:", error);
      if((error.message as String).includes("No transaction was found for this id")){
         await this.transactionModel.findOneAndUpdate({
        reference: ref,
      },{
        status:TransactionStatus.CANCELLED
      });
     
      }
      throw new NotAcceptableException(error?.message);
    }
  }
}

// Define the structure of PaymentRequestDTO

interface Customer {
  phonenumber: string;
  name: string;
  email: string;
}

interface Customizations {
  title: string;
  logo: string;
  description: string;
}

export interface PaymentRequestDTO {
  amount: number;

  redirect_url: string;
}

// Create PaymentRequestDTO instance
