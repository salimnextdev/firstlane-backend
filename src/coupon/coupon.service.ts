import { Injectable } from '@nestjs/common';
import { CouponModel, CouponDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class CouponService {
 constructor(
    @InjectModel(CouponModel.name)
    private couponModel: Model<CouponDoc>,){

 }
  async upset(
    createCouponDto: CouponDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.couponModel.create(createCouponDto);
    return serviceResponse({
      data: await created.save(),
      message: "Coupon plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.couponModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Coupon plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.couponModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.couponModel.findById(id).populate("userID").exec();

      return serviceResponse({
        data: plan,
        message: "Coupon plan retrieved successfully",
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

    const plans = await this.couponModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Coupon plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.couponModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateCouponDto: CouponDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.couponModel
        .findByIdAndUpdate(id, updateCouponDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Coupon plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Coupon plan updated successfully",
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
      
      const result = await this.couponModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No coupon plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} coupon plans deleted successfully`,
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
