import { AppTypeEnum, InvestmentStatus, InvestmentType } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
import { Document } from "mongoose";

export type CouponDoc = CouponModel & Document;

@Schema({ timestamps: true })
export class CouponModel {
  @Prop({ ref: "UserModel" })
  userIDs: string[];
  @Prop({ ref: "UserModel" })
  userID: string;
  @Prop({})
  code: string;
   @Prop({})
  value: number;
   @Prop({default:"NGN"})
  currency: string;
  @Prop({ enum: AppTypeEnum, default: AppTypeEnum.INVESTMENT })
  type: string;
  @Prop({ default: 1 })
  max: string;
  // Track which users have redeemed this coupon
  @Prop({ type: [String], ref: "UserModel", default: [] })
  usedBy: string[];
}

export const CouponSchema = SchemaFactory.createForClass(CouponModel);
CouponSchema.pre<CouponModel>("save", async function (next, error) {
  this.code =
    randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);

  next();
});
