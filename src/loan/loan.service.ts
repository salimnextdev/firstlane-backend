import { Injectable } from "@nestjs/common";
import {
  LoanModel,
  LoanDoc,
  UserModel,
  UserDoc,
  SettingsModel,
  SettingsDoc,
} from "@app/schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LoanDTO, UserDTO } from "@app/dto";
import {
  ObjectReturnType,
  serviceResponse,
  getMetadata,
  NotificationService,
} from "@app/service";
import { LoanStatus, LoanType, UserType } from "@app/enum";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class LoanService {
  constructor(
    @InjectModel(LoanModel.name)
    private loanModel: Model<LoanDoc>,
    @InjectModel(UserModel.name)
    private userModel: Model<UserDoc>,
    @InjectModel(SettingsModel.name)
    private settingsModelModel: Model<SettingsDoc>,
    private notificationActivity: NotificationService
  ) {}

  async upset(
    createLoanDto: LoanDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      let refBy;
      if (createLoanDto.refCode) {
        const user = await this.userModel.findOne({
          refCode: createLoanDto.refCode,
        });
        refBy = user._id.toString();
      }

      const settings = await this.settingsModelModel.findOne().exec();
      const interest =
        createLoanDto.loanType === LoanType.BUSINESS
          ? settings.loanSettings.businessLoanInterestRate 
          : createLoanDto.loanType === LoanType.EMPLOYEE
          ? settings.loanSettings.employeeLoanInterestRate
          : settings.loanSettings.personalLoanInterestRate;
      const created = await this.loanModel.create({
        ...createLoanDto,
        interest,
        userID: userData._id.toString(),
        refBy,
      });

      const admins = await this.userModel
        .find({ userType: UserType.ADMIN })
        .exec();

      for (const admin of admins) {
        await this.notificationActivity.notificationActivity({
          entityType: "loan",
          entityID: created._id.toString(),
          userID: admin._id.toString(),
          action: "New Loan Application",
          details: `A new loan application has been submitted by  ${userData.fullname}`,
          playerIds: [admin.playerId],
        });
      }

      return serviceResponse({
        data: await created.save(),
        message: "Loan plan created successfully",

        status: true,
      });
    } catch (error) {
      return serviceResponse({
        data: null,
        message: error.message,
        status: false,
      });
    }
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.loanModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Loan plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.loanModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.loanModel.findById(id).populate("userID").exec();

      return serviceResponse({
        data: plan,
        message: "Loan plan retrieved successfully",
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

    const plans = await this.loanModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Loan plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.loanModel,
        query,
        querys: { [key]: value },
      }),
    });
  }
  // findByMany
  async findByMany(data: LoanDTO, query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.loanModel
      .find(data)
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Loan plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.loanModel,
        query,
        querys: data,
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateLoanDto: LoanDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.loanModel
        .findByIdAndUpdate(id, updateLoanDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Loan plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Loan plan updated successfully",
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
      const result = await this.loanModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No loan plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} loan plans deleted successfully`,
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
