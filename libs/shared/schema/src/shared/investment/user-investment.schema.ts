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
    default: UserInvestmentStatus.ACTIVE
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

  @Prop({ ref:"UserModel"})
  refBy?:string
 @Prop({ 
    enum:["Daily","Weekly","Monthly","Quarterly","Yearly"],default:"Monthly"
  })
  repaymentInterval:string

  @Prop({})
  investmentDueDate: Date;

  @Prop({ default: null })
  lastExpectedReturnUpdate: Date;

  @Prop({ default: null })
  withdrawalDate: Date;
}

export const UserInvestmentSchema = SchemaFactory.createForClass(UserInvestmentModel);

// Generate investment code before saving
UserInvestmentSchema.pre('save', async function(next) {
  if(this.isNew ){
    this.id = randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);
   this.investmentCode = randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);
   this.investmentDueDate = calculateInvestmentDueDate(this.duration);
   this.maturityDate = this.investmentDueDate
  }
    
  next();
});
// Calculate investmentDueDate date based on duration (10 days, 3 months)
function calculateInvestmentDueDate(duration: string): Date {
  const [value, unit] = duration.split(' ');
  const amount = parseInt(value, 10);

  if (unit === 'days') {
    return new Date(Date.now() + amount * 24 * 60 * 60 * 1000);
  } else if (unit === 'months') {
    return new Date(Date.now() + amount * 30 * 24 * 60 * 60 * 1000);
  } else {
    throw new Error('Invalid duration unit. Use "days" or "months".');
  }
}