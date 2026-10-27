import { Injectable } from '@nestjs/common';
import { PurposeModel, PurposeDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurposeDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class PurposeService {
 constructor(
    @InjectModel(PurposeModel.name)
    private purposeModel: Model<PurposeDoc>,){

 }
  async upset(
    createPurposeDto: PurposeDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.purposeModel.create(createPurposeDto);
    return serviceResponse({
      data: await created.save(),
      message: "Purpose plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.purposeModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Purpose plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.purposeModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.purposeModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "Purpose plan retrieved successfully",
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

    const plans = await this.purposeModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Purpose plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.purposeModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updatePurposeDto: PurposeDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.purposeModel
        .findByIdAndUpdate(id, updatePurposeDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Purpose plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Purpose plan updated successfully",
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
      
      const result = await this.purposeModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No purpose plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} purpose plans deleted successfully`,
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
