import { InvestmentStatus, InvestmentType } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
import { Document } from "mongoose";

export type InvestmentDoc = InvestmentModel & Document;

@Schema({ timestamps: true })
export class InvestmentModel {

  @Prop({default:false})
  isUsed:boolean;
  @Prop({})
  id:string;
  @Prop({})
  firstname: string;
 @Prop({ ref:"UserModel"})
  refBy?:string
  @Prop({})
  lastname: string;

  @Prop({})
  email: string;

  @Prop({})
  phone: string;

  @Prop({ min: 0 })
  amount: number;

  @Prop({ min: 0, max: 100 })
  interestRate: number;

  @Prop({ enum: InvestmentType, default: InvestmentType.SHORT_TERM })
  investmentType: string;

  @Prop({})
  investmentDueDate: Date;

  @Prop({})
  code: string;

  @Prop({ default: InvestmentStatus.PENDING, enum: InvestmentStatus })
  status: string;

  @Prop({ ref: "UserModel" })
  userId: string;
  @Prop({ })
  durations:string[]

 @Prop({ })
  duration:string
}

export const InvestmentSchema = SchemaFactory.createForClass(
  InvestmentModel
);
InvestmentSchema.pre<InvestmentModel>("save", async function (
  next,
  error
) {
  this.id =
  randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);

  if (!this.code)
    this.code =
      randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);

  next();
});
