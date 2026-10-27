import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CouponModel, CouponDoc, WalletModel, WalletDoc } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata, FlutterwaveService } from '@app/service';

@Injectable()
export class CouponService {
 constructor(
    @InjectModel(CouponModel.name)
    private couponModel: Model<CouponDoc>,
    @InjectModel(WalletModel.name)
    private walletModel: Model<WalletDoc>,
    private flutterwaveService: FlutterwaveService
){

 }
  async upset(
    createCouponDto: CouponDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {

    const balanceResponse = await this.flutterwaveService.getAvailableBalance(userData._id.toString());
      const availableBalance = balanceResponse.data.available_balance;

      // Check if user has sufficient balance
      if (availableBalance < createCouponDto.value) {
        return serviceResponse({
          message: `Insufficient balance. `,
          status: false,
        });
      }
    const created = await this.couponModel.create({...createCouponDto,userID:userData._id.toString()});
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
      .populate("userIDs")
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
      const plan = await this.couponModel.findById(id).populate("userIDs").exec();

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
      .populate("userIDs")
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

  async redeem(code: string, user: UserDTO): Promise<ObjectReturnType> {
    try {
      // Find coupon by code
      const coupon = await this.couponModel.findOne({ code }).exec();
      
      if (!coupon) {
        return serviceResponse({
          message: "Coupon not found",
          status: false,
        });
      }

      // Check if coupon is already used by this user
      if (coupon.usedBy.includes(user._id.toString())) {
        return serviceResponse({
          message: "Coupon already redeemed by this user",
          status: false,
        });
      }

      // Check if max redemptions reached
      if (coupon.usedBy.length >= parseInt(coupon.max)) {
        return serviceResponse({
          message: "Coupon redemption limit reached",
          status: false,
        });
      }

      // Get user's wallet balance
      const balanceResponse = await this.flutterwaveService.getAvailableBalance(coupon.userID);
      const availableBalance = balanceResponse.data.available_balance;

      // Check if user has sufficient balance
      if (availableBalance < coupon.value) {
        return serviceResponse({
          message: `Insufficient balance. please contact administrator`,
          status: false,
        });
      }

      // Get coupon creator's wallet for transfer
      const creatorWallet = await this.walletModel.findOne({ userID: coupon.userID }).exec();
       const userWallet = await this.walletModel.findOne({ userID: user._id.toString() }).exec();
      if (!creatorWallet||!userWallet) {
        return serviceResponse({
          message: "Coupon creator || user wallet not found",
          status: false,
        });
      }

      // Perform wallet-to-wallet transfer
      const transferData = {
        account_bank: userWallet.bankCode,
        account_number: userWallet.accountNumber,
        amount: coupon.value,
        narration: `Coupon redemption: ${code}`,
        reference: `COUPON_${code}_${Date.now()}`,
        debit_subaccount: creatorWallet.customerCode,
      };

      const transferResponse = await this.flutterwaveService.walletToWalletTransfer(transferData);

      if (transferResponse.status !== 'success') {
        return serviceResponse({
          message: "Transfer failed",
          status: false,
          data: transferResponse,
        });
      }

      // Mark coupon as used by this user
      await this.couponModel.findByIdAndUpdate(
        coupon._id,
        { $addToSet: { usedBy: user._id.toString() } },
        { new: true }
      ).exec();

      return serviceResponse({
        data: {
          coupon: {
            code: coupon.code,
            value: coupon.value,
            currency: coupon.currency,
          },
          transfer: transferResponse,
        },
        message: "Coupon redeemed successfully",
        status: true,
      });

    } catch (error) {
      return serviceResponse({
        message: error.message || "Failed to redeem coupon",
        status: false,
      });
    }
  }
}
