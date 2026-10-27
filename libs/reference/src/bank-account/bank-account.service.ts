import { Injectable } from '@nestjs/common';
import { BankAccountModel, BankAccountDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankAccountDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata } from '@app/service';

@Injectable()
export class BankAccountService {
 constructor(
    @InjectModel(BankAccountModel.name)
    private bankAccountModel: Model<BankAccountDoc>,){

 }
  async upset(
    createBankAccountDto: BankAccountDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const created = await this.bankAccountModel.create(createBankAccountDto);
    return serviceResponse({
      data: await created.save(),
      message: "BankAccount plan created successfully",

      status: true,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.bankAccountModel
      .find()
      .skip(skip)
      .limit(limit).populate("userID","name email fullname firstname lastname phone userType").populate("currencyID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "BankAccount plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.bankAccountModel,
        query,
        querys: {},
      }),
    });
  }
  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.bankAccountModel.findById(id).exec();

      return serviceResponse({
        data: plan,
        message: "BankAccount plan retrieved successfully",
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

    const plans = await this.bankAccountModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit).populate("userID","name email fullname firstname lastname phone userType").populate("currencyID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "BankAccount plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.bankAccountModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateBankAccountDto: BankAccountDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.bankAccountModel
        .findByIdAndUpdate(id, updateBankAccountDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "BankAccount plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "BankAccount plan updated successfully",
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
      
      const result = await this.bankAccountModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No bankAccount plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} bankAccount plans deleted successfully`,
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
