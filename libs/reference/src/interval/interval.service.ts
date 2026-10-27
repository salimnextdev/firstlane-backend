import { Injectable } from '@nestjs/common';
import { IntervalModel, IntervalDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntervalDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class IntervalService {
 constructor(
    @InjectModel(IntervalModel.name)
    private intervalModel: Model<IntervalDoc>,){

 }
  async upset(
    createIntervalDto: IntervalDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.intervalModel.create(createIntervalDto);
    return serviceResponse({
      data: await created.save(),
      message: "Interval plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.intervalModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Interval plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.intervalModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.intervalModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Interval plan retrieved successfully",
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

    const plans = await this.intervalModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Interval plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.intervalModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateIntervalDto: IntervalDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.intervalModel
        .findByIdAndUpdate(id, updateIntervalDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Interval plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Interval plan updated successfully",
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
      
      const result = await this.intervalModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No interval plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} interval plans deleted successfully`,
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
