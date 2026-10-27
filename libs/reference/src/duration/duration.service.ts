import { Injectable } from '@nestjs/common';
import { DurationModel, DurationDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DurationDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class DurationService {
 constructor(
    @InjectModel(DurationModel.name)
    private durationModel: Model<DurationDoc>,){

 }
  async upset(
    createDurationDto: DurationDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.durationModel.create(createDurationDto);
    return serviceResponse({
      data: await created.save(),
      message: "Duration plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.durationModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Duration plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.durationModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.durationModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Duration plan retrieved successfully",
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

    const plans = await this.durationModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Duration plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.durationModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateDurationDto: DurationDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.durationModel
        .findByIdAndUpdate(id, updateDurationDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Duration plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Duration plan updated successfully",
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
      
      const result = await this.durationModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No duration plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} duration plans deleted successfully`,
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
