import { Injectable } from '@nestjs/common';
import { FxRateModel, FxRateDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FxRateDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class FxRateService {
 constructor(
    @InjectModel(FxRateModel.name)
    private fxRateModel: Model<FxRateDoc>,){

 }
  async upset(
    createFxRateDto: FxRateDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.fxRateModel.create(createFxRateDto);
    return serviceResponse({
      data: await created.save(),
      message: "FxRate plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.fxRateModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("baseCurrency.currencyID")
      .populate("userID")
      .populate("fxRateID")
      .populate("targetCurrency.currencyID")
      .exec();
    return serviceResponse({
      data: plans,
      message: "FxRate plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.fxRateModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.fxRateModel.findById(id).populate("baseCurrency.currencyID")
      .populate("userID")
      .populate("FxRateID")
      .populate("targetCurrency.currencyID").exec();

      return serviceResponse({
        data: plan,
        message: "FxRate plan retrieved successfully",
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

    const plans = await this.fxRateModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
        .populate("baseCurrency.currencyID")
        .populate("userID")
        .populate("FxRateID")
      .populate("targetCurrency.currencyID")
      .exec();
    return serviceResponse({
      data: plans,
      message: "FxRate plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.fxRateModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateFxRateDto: FxRateDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.fxRateModel
        .findByIdAndUpdate(id, updateFxRateDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "FxRate plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "FxRate plan updated successfully",
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
      
      const result = await this.fxRateModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No fxRate plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} fxRate plans deleted successfully`,
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
