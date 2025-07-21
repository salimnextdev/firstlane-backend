import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { randomInt, randomUUID } from "crypto";
import { RepaymentIntervalIDays, UserInvestmentStatus } from "@app/enum";

export type UserInvestmentDoc = UserInvestmentModel & Document;

@Schema({ timestamps: true })
export class UserInvestmentModel {

    @Prop({  })
    id: string;

  @Prop({  ref: 'UserModel' })
  userID: string;

  @Prop({  ref: 'InvestmentPlanModel' })
  investmentID: string;

  @Prop({  min: 0 })
  amount: number;

  @Prop({ 
    
    enum: UserInvestmentStatus,
    default: UserInvestmentStatus.PENDING
  })
  status: string;

  @Prop({  })
  maturityDate: Date;

  @Prop({  })
  duration: string;

  @Prop({  min: 0, max: 100 })
  interestRate: number;

  @Prop({  min: 0 })
  expectedReturn: number;

  @Prop({ default: 0, min: 0 })
  interestEarned: number;

  @Prop({ })
  investmentCode: string;

  
 @Prop({ })
  repaymentInterval:string
}

export const UserInvestmentSchema = SchemaFactory.createForClass(UserInvestmentModel);

// Generate investment code before saving
UserInvestmentSchema.pre('save', async function(next) {
  
    this.id = randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);
  
  next();
});
