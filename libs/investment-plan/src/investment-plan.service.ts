import { InvestmentPlanDTO, UserDTO } from "@app/dto";
import { InvestmentPlanDoc, InvestmentPlanModel, UserInvestmentDoc, UserInvestmentModel } from "@app/schema";
import { getMetadata, ObjectReturnType, serviceResponse } from "@app/service";
import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class InvestmentPlanService {
  constructor(
    @InjectModel(InvestmentPlanModel.name)
    private investmentPlanModel: Model<InvestmentPlanDoc>,
      @InjectModel(UserInvestmentModel.name)
        private userInvestmentModel: Model<UserInvestmentDoc>,
  ) {}

  async upset(
    createInvestmentPlanDto: InvestmentPlanDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const createdPlan = await this.investmentPlanModel.create(
        createInvestmentPlanDto
      );
      return serviceResponse({
        data: await createdPlan.save(),
        message: "Investment plan created successfully",
  
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error?.response?.data?.message || error.message);
    }
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page -1)* limit;

    const plans = await this.investmentPlanModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Investment plans retrieved successfully",
      status: true,
      metadata:await getMetadata({
        model: this.investmentPlanModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.investmentPlanModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Investment plan retrieved successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error?.response?.data?.message || error.message);
   
    }
  }

  //find by any 
    async findByAny(
        params: { key: string; value: string },
        query: any
    ): Promise<ObjectReturnType> {
        try {
          const { key, value } = params;
        const { limit = 10, page = 1 } = query;
        const skip = (page -1)* limit;
    
        const plans = await this.investmentPlanModel
        .find({ [key]: value })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
        return serviceResponse({
        data: plans,
        message: "Investment plans retrieved successfully",
        status: true,
        metadata:await getMetadata({
            model: this.investmentPlanModel,
            query,
            querys: { [key]: value },
        }),
        });
        } catch (error) {
          throw new NotAcceptableException(error?.response?.data?.message || error.message);
   
        }
    }

    //edit
  async update(
   
    updateInvestmentPlanDto: InvestmentPlanDTO,
    userData:UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updatedPlan = await this.investmentPlanModel
        .findByIdAndUpdate(updateInvestmentPlanDto._id, updateInvestmentPlanDto, { new: true })
        .exec();

      if (!updatedPlan) {
        return serviceResponse({
          message: "Investment plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updatedPlan,
        message: "Investment plan updated successfully",
        status: true,
      });
    } catch (error) {
      throw new NotAcceptableException(error?.response?.data?.message || error.message);
   
    }
  }

  async delete(ids: string[],userData:UserDTO): Promise<ObjectReturnType> {
    try {
      const result = await this.investmentPlanModel.deleteMany({
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
      throw new NotAcceptableException(error?.response?.data?.message || error.message);
   
    }
  }

  async deletePlan(ids: string,investmentPlanID:string, userData: UserDTO): Promise<ObjectReturnType> {
    try {
      const investmentPlan = await this.investmentPlanModel.findByIdAndDelete(ids).exec();
      if (!investmentPlan) {
        return serviceResponse({
          message: "Investment plan not found",
          status: false,
        });
      }
const toTinvestmentPlan = await this.investmentPlanModel.findById(investmentPlanID).exec();
      if (!investmentPlan) {
        return serviceResponse({
          message: "Investment plan not found",
          status: false,
        });
      }

      await this.userInvestmentModel.findByIdAndUpdate({
        investmentPlanID: { $in: ids },
      }, {
        investmentPlanID: toTinvestmentPlan._id.toString(),
        ...toTinvestmentPlan.toJSON()
      })
      const result = await this.investmentPlanModel.deleteMany({
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
}


// async userInvest(
//     investmentData: Partial<UserInvestmentDTO>,
//     userData: UserDTO
//   ): Promise<ObjectReturnType> {
//     try {
//       const investment = await this.investmentPlanModel
//         .findById(investmentData.investmentID)
//         .exec();
//       if (!investment) {
//         throw new NotFoundException("Investment plan not found");
//       }
//       // if(investment.userIDs.includes(userData._id.toString())){
//       //   throw new NotAcceptableException("User already invested in this plan");
//       // }
//       if (
//         investmentData.amount < investment.minAmount ||
//         investmentData.amount > investment.maxAmount
//       ) {
//         throw new NotAcceptableException(
//           `Investment amount is not within range ${investment.minAmount} - ${investment.maxAmount}`
//         );
//       }

//       const wallet = await this.flutterwaveService.getAvailableBalance(
//         userData._id.toString()
//       );
//       if ((wallet?.data?.available_balance ?? 0) < investmentData.amount) {
//         throw new Error("Insufficient balance");
//       }
//        let refBy
//       if(investmentData.refCode){
//         const user= await this.userModel.findOne({refCode:investmentData.refCode})
//         refBy=user._id.toString()
//       }
//       const userInvestment = new this.userInvestmentModel(
//         {...investmentData,userID:userData._id.toString(),refBy:refBy}
//       );
//       const userWallet = await this.walletModel.findOne({
//         userID: userData._id.toString(),
//       });
     

//       const res = await this.flutterwaveService.walletToWalletTransfer({
//         account_bank: "flutterwave",
//         account_number: this.config.get("FLUTTERMERCHANTID"),
//         amount: investmentData.amount,
//         narration: `Investment of ${investmentData.amount} in ${investment.name}`,
//         reference: `${userData._id}_${userInvestment._id}`,
//         debit_subaccount: userWallet.customerCode,
//       });
//       investment.userIDs.push(userData._id.toString()) 
//       await investment.save()
//      await userInvestment.save()
//       console.log(res)
//       return serviceResponse({
//         data: userInvestment,
//         message: "User investment created successfully",
//         status: true,
//       });
//     } catch (error) {
//       throw new NotAcceptableException(error?.response?.data?.message|| error.message);
//     }
//   }