import { InvestmentDTO, UserDTO, UserInvestmentDTO } from "@app/dto";
import { InvestmentStatus, TransactionStatus, TransactionType } from "@app/enum";
import {
  InvestmentDoc,
  InvestmentModel,
  InvestmentPlanDoc,
  InvestmentPlanModel,
  TransactionDoc,
  TransactionModel,
  UserDoc,
  UserInvestmentDoc,
  UserInvestmentModel,
  UserModel,
  WalletDoc,
  WalletModel,
} from "@app/schema";
import {
  FlutterwaveService,
  getMetadata,
  NotificationService,
  ObjectReturnType,
  serviceResponse,
} from "@app/service";
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class InvestmentService {
  constructor(
    private config: ConfigService,
    @InjectModel(InvestmentModel.name)
    private investmentModel: Model<InvestmentDoc>,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>,
    @InjectModel(InvestmentPlanModel.name)
    private investmentPlanModel: Model<InvestmentPlanDoc>,
    @InjectModel(WalletModel.name)
    private walletModel: Model<WalletDoc>,
     @InjectModel(UserModel.name)
    private userModel: Model<UserDoc>,
    private flutterwaveService: FlutterwaveService,
    private notificationService: NotificationService
  ) {}

  async upset(
    createInvestmentDto: InvestmentDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.investmentModel.create(createInvestmentDto);
    return serviceResponse({
      data: await created.save(),
      message: "Investment plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.investmentModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Investment plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.investmentModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.investmentModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Investment plan retrieved successfully",
        status: true,
      });
    } catch (error) {}
  }

  //find by any
  async findByAny(
    params: { key: string; value: string },
    query: any
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.investmentModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Investment plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.investmentModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    updateInvestmentDto: InvestmentDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.investmentModel
        .findByIdAndUpdate(updateInvestmentDto._id, updateInvestmentDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Investment plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Investment plan updated successfully",
        status: true,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }

  async delete(ids: string[],investmentID:string, userData: UserDTO): Promise<ObjectReturnType> {
    try {
      await this.userInvestmentModel.updateMany({
        investmentID: { $in: ids },
      }, {
        investmentID,
      })
      const result = await this.investmentModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No investment plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} investment plans deleted successfully`,
        status: true,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }

  //user investment
  async userInvest(
    investmentData: Partial<UserInvestmentDTO>,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const investment = await this.investmentPlanModel
        .findById(investmentData.investmentID)
        .exec();
      if (!investment) {
        throw new NotFoundException("Investment plan not found");
      }
      // if(investment.userIDs.includes(userData._id.toString())){
      //   throw new NotAcceptableException("User already invested in this plan");
      // }
      if (
        investmentData.amount < investment.minAmount ||
        investmentData.amount > investment.maxAmount
      ) {
        throw new NotAcceptableException(
          `Investment amount is not within range ${investment.minAmount} - ${investment.maxAmount}`
        );
      }

      const wallet = await this.flutterwaveService.getAvailableBalance(
        userData._id.toString()
      );
      if ((wallet?.data?.available_balance ?? 0) < investmentData.amount) {
        throw new Error("Insufficient balance");
      }
       let refBy
      if(investmentData.refCode){
        const user= await this.userModel.findOne({refCode:investmentData.refCode})
        refBy=user._id.toString()
      }
      const userInvestment = new this.userInvestmentModel(
        { ...investmentData,userID:userData._id.toString(),refBy:refBy,interestRate:investment.interestRate,status:InvestmentStatus.ACTIVE }
      );
      const userWallet = await this.walletModel.findOne({
        userID: userData._id.toString(),
      });
     const admin = await this.userModel.findOne({isSuperAdmin: true})
      const adminWallet= await this.walletModel.findOne({userID:admin._id.toString()})

      const res = await this.flutterwaveService.walletToWalletTransfer({
        account_bank: "flutterwave",
        account_number: adminWallet.barter_id,
        amount: investmentData.amount,
        narration: `Investment of ${investmentData.amount} in ${investment.name}`,
        reference: `${userData._id}_${userInvestment._id}`,
        debit_subaccount: userWallet.customerCode,
      });
      
      const transaction = await this.transactionModel.create({
        userID: userData._id.toString(),
        amount: investmentData.amount,
        reference: res?.response?.data?.reference,
        type: TransactionType.INVESTMENT,
        status: TransactionStatus.PAID,
       
        senderBank: userWallet.bankName,
        senderAccountNumber: userWallet.accountNumber,
      });
      investment.userIDs.push(userData._id.toString()) 
      await investment.save()
     await userInvestment.save()
      console.log(res)
      return serviceResponse({
        data: userInvestment,
        message: "User investment created successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error?.response?.data?.message|| error.message);
    }
  }

  //get user investments
  async getUserInvestments(userID: string): Promise<ObjectReturnType> {
    try {
      const investments = await this.userInvestmentModel.find({
        userID,
      }).populate("investmentID");
      return serviceResponse({
        data: investments,
        message: "User investments retrieved successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException( error.message);
    }
  }

 async getbyInvestmentCode(code:string): Promise<ObjectReturnType> {
    try {
      const investment = await this.investmentModel.findOne({
        code: code,
      })
      if (!investment) {
        throw new NotFoundException("Investment not found");
      }
      return serviceResponse({
        data: investment,
        message: "Investment retrieved successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error.message);
    }

  }

 async copyInvestment(code:string, userData: UserDTO): Promise<ObjectReturnType> {
    try {
      const investment = await this.investmentModel.findOne({
        code: code,
      })
      if (!investment) {
        throw new NotFoundException("Investment not found");
      }
      if(investment.isUsed){
        throw new NotAcceptableException("Investment already used");
      }

      const wallet = await this.flutterwaveService.getAvailableBalance(
        userData._id.toString()
      );
      if ((wallet?.data?.available_balance ?? 0) < investment.amount) {
        throw new Error("Insufficient balance");
      }
      const userWallet = await this.walletModel.findOne({
        userID: userData._id.toString(),
      });
      let refBy
      if(investment.refBy){
        const user= await this.userModel.findOne({refCode:investment.refBy})
        refBy=user._id.toString()
      }
      const newInvestment = new this.userInvestmentModel({
        ...investment.toObject(),
        userID: userData._id.toString(),
        _id: undefined, 
        investmentCode: undefined, 
        refBy
      });
      const admin = await this.userModel.findOne({isSuperAdmin: true})
      const adminWallet= await this.walletModel.findOne({userID:admin._id.toString()})
const res = await this.flutterwaveService.walletToWalletTransfer({
        account_bank: "flutterwave",
        account_number: adminWallet.barter_id,
        amount: investment.amount,
        narration: `Investment of ${investment.amount} in ${investment.investmentType}`,
        reference: `${userData._id}_${newInvestment._id}`,
        debit_subaccount: userWallet.customerCode,
      });
      const transaction = await this.transactionModel.create({
        userID: userData._id.toString(),
        amount: investment.amount,
        reference: res?.response?.data?.reference,
        type: TransactionType.INVESTMENT,
        status: TransactionStatus.PAID,
       
        senderBank: userWallet.bankName,
        senderAccountNumber: userWallet.accountNumber,
      });
      // investmentPlan.userIDs.push(userData._id.toString()) 
      
      await newInvestment.save();
      return serviceResponse({
        data: newInvestment,
        message: "Investment copied successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error.message);
    }

  }

//  async getbyInvestmentCode(code:string): Promise<ObjectReturnType> {
//     try {
//       const investment = await this.userInvestmentModel.findOne({
//         investmentCode: code,
//       }).populate("userID investmentID");
//       if (!investment) {
//         throw new NotFoundException("Investment not found");
//       }
//       return serviceResponse({
//         data: investment,
//         message: "Investment retrieved successfully",
//         status: true,
//       });
//     } catch (error) {
//       throw new NotAcceptableException(error.message);
//     }

//   }

//  async copyInvestment(code:string, userData: UserDTO): Promise<ObjectReturnType> {
//     try {
//       const investment = await this.userInvestmentModel.findOne({
//         investmentCode: code,
//       })
//       if (!investment) {
//         throw new NotFoundException("Investment not found");
//       }

//       const wallet = await this.flutterwaveService.getAvailableBalance(
//         userData._id.toString()
//       );
//       if ((wallet?.data?.available_balance ?? 0) < investment.amount) {
//         throw new Error("Insufficient balance");
//       }
//       const userWallet = await this.walletModel.findOne({
//         userID: userData._id.toString(),
//       });
     
//       const newInvestment = new this.userInvestmentModel({
//         ...investment.toObject(),
//         userID: userData._id.toString(),
//         _id: undefined, 
//         investmentCode: undefined, 
//       });
//       const investmentPlan = await this.investmentPlanModel
//         .findById(investment.investmentID)
//         .exec();
// const res = await this.flutterwaveService.walletToWalletTransfer({
//         account_bank: "flutterwave",
//         account_number: this.config.get("FLUTTERMERCHANTID"),
//         amount: investment.amount,
//         narration: `Investment of ${investment.amount} in ${investmentPlan.name}`,
//         reference: `${userData._id}_${newInvestment._id}`,
//         debit_subaccount: userWallet.customerCode,
//       });
//       investmentPlan.userIDs.push(userData._id.toString()) 
      
//       await newInvestment.save();
//       return serviceResponse({
//         data: newInvestment,
//         message: "Investment copied successfully",
//         status: true,
//       });
//     } catch (error) {
//       throw new NotAcceptableException(error.message);
//     }

//   }
}
