import { Injectable } from '@nestjs/common';
import { CurrencyModel, CurrencyDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrencyDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class CurrencyService {
 constructor(
    @InjectModel(CurrencyModel.name)
    private currencyModel: Model<CurrencyDoc>,){

 }
  async upset(
    createCurrencyDto: CurrencyDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.currencyModel.create(createCurrencyDto);
    return serviceResponse({
      data: await created.save(),
      message: "Currency plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.currencyModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Currency plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.currencyModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.currencyModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Currency plan retrieved successfully",
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

    const plans = await this.currencyModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Currency plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.currencyModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateCurrencyDto: CurrencyDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.currencyModel
        .findByIdAndUpdate(id, updateCurrencyDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Currency plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Currency plan updated successfully",
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
      
      const result = await this.currencyModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No currency plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} currency plans deleted successfully`,
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
