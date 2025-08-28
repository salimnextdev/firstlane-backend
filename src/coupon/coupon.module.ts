import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { FlutterwaveService } from '@app/service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, FlutterwaveService],
})
export class CouponModule {}
