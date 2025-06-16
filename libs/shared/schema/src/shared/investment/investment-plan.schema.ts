import { InvestmentStatus, InvestmentType } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
import { Document } from "mongoose";

export type InvestmentPlanDoc = InvestmentPlanModel & Document;

@Schema({ timestamps: true })
export class InvestmentPlanModel {
  @Prop({ min: 0 })
  minAmount: number;

  @Prop({ min: 0, max: 100 })
  interestRate: number;

  @Prop({ enum: InvestmentType, default: InvestmentType.SHORT_TERM })
  investmentType: string;

  @Prop({})
  investmentDueDate: Date;

  @Prop({})
  code: string;
  @Prop({})
  duration: string;

  @Prop({ default: InvestmentStatus.PENDING, enum: InvestmentStatus })
  status: string;

  @Prop({ ref: "UserModel", default: [] })
  userIDs: string[];
  @Prop({ ref: "UserModel" })
  userID: string;
}

export const InvestmentPlanSchema = SchemaFactory.createForClass(
  InvestmentPlanModel
);
InvestmentPlanSchema.pre<InvestmentPlanModel>("save", async function (
  next,
  error
) {
  if (!this.code)
    this.code =
      randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);

  next();
});
