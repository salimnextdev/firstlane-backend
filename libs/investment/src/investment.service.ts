import { InvestmentDTO, UserDTO, UserInvestmentDTO } from "@app/dto";
import {
  InvestmentDoc,
  InvestmentModel,
  UserInvestmentDoc,
  UserInvestmentModel,
} from "@app/schema";
import { getMetadata, ObjectReturnType, serviceResponse } from "@app/service";
import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(InvestmentModel.name)
    private investmentModel: Model<InvestmentDoc>,
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>
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
      const investment = await this.investmentModel
        .findById(investmentData.investmentID)
        .exec();
      if (!investment) {
        throw new NotFoundException("Investment not found");
      }
      const userInvestment = await this.userInvestmentModel.create(
        investmentData
      );
      //TODO add balance check
      return serviceResponse({
        data: userInvestment,
        message: "User investment created successfully",
        status: true,
      });
    } catch (error) {
          throw new NotAcceptableException(error.message);
    }
  }
}
