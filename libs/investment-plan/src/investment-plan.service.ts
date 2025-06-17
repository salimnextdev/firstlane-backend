import { InvestmentPlanDTO, UserDTO } from "@app/dto";
import { InvestmentPlanDoc, InvestmentPlanModel } from "@app/schema";
import { getMetadata, ObjectReturnType, serviceResponse } from "@app/service";
import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class InvestmentPlanService {
  constructor(
    @InjectModel(InvestmentPlanModel.name)
    private investmentPlanModel: Model<InvestmentPlanDoc>
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
}
