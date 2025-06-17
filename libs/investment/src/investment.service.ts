import { InvestmentDTO, UserDTO, UserInvestmentDTO } from "@app/dto";
import {
  InvestmentDoc,
  InvestmentModel,
  InvestmentPlanDoc,
  InvestmentPlanModel,
  UserInvestmentDoc,
  UserInvestmentModel,
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
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>,
    @InjectModel(InvestmentPlanModel.name)
    private investmentPlanModel: Model<InvestmentPlanDoc>,
    @InjectModel(WalletModel.name)
    private walletModel: Model<WalletDoc>,
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

  async delete(ids: string[], userData: UserDTO): Promise<ObjectReturnType> {
    try {
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
    investmentData: UserInvestmentDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const investment = await this.investmentPlanModel
        .findById(investmentData.investmentID)
        .exec();
      if (!investment) {
        throw new NotFoundException("Investment plan not found");
      }
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
      const userInvestment = new this.userInvestmentModel(
        investmentData
      );
      const userWallet = await this.walletModel.findOne({
        userID: userData._id.toString(),
      });

      const res = await this.flutterwaveService.walletToWalletTransfer({
        account_bank: "flutterwave",
        account_number: this.config.get("FLUTTERMERCHANTID"),
        amount: investmentData.amount,
        narration: `Investment of ${investmentData.amount} in ${investment.name}`,
        reference: `${userData._id}_${userInvestment._id}`,
        debit_subaccount: userWallet.customerCode,
      });
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
}
