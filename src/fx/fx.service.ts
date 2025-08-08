import { Injectable } from '@nestjs/common';
import { FxModel, FxDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FxDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class FxService {
 constructor(
    @InjectModel(FxModel.name)
    private fxModel: Model<FxDoc>,){

 }
  async upset(
    createFxDto: FxDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.fxModel.create(createFxDto);
    return serviceResponse({
      data: await created.save(),
      message: "Fx plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.fxModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).populate("userID").populate("fromCurrency.currencyID").populate("toCurrency.currencyID")
      .exec();
    return serviceResponse({
      data: plans,
      message: "Fx plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.fxModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.fxModel.findById(id).populate("userID").populate("fromCurrency.currencyID").populate("toCurrency.currencyID").exec();

      return serviceResponse({
        data: plan,
        message: "Fx plan retrieved successfully",
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

    const plans = await this.fxModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).populate("userID").populate("fromCurrency.currencyID").populate("toCurrency.currencyID")
      .exec();
    return serviceResponse({
      data: plans,
      message: "Fx plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.fxModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateFxDto: FxDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.fxModel
        .findByIdAndUpdate(id, updateFxDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Fx plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Fx plan updated successfully",
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
      
      const result = await this.fxModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No fx plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} fx plans deleted successfully`,
        status: true,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }
  //change status
  async changeStatus(
    id: string,
    status: string,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.fxModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Fx plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Fx plan status updated successfully",
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
