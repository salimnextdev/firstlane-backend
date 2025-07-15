import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
// Optionally, add ID generator middleware
import { randomInt, randomUUID } from "crypto";
import { LoanStatus, LoanType } from "@app/enum";

export type LoanDoc = LoanModel & Document;

@Schema({ timestamps: true })
export class LoanModel {

  @Prop()
  id: string;
  @Prop({ ref:"UserModel" })
  userID:string

  @Prop({ ref:"UserModel" })
  adminID:string
  @Prop({  min: 0 })
  amountRequested: number;
  @Prop({  })
  notes: string;
  @Prop({  })
  purpose: string;

  @Prop({  })
  tenure: string;

  @Prop({  })
  repaymentInterval: string;

  @Prop({ enum:LoanType })
  loanType: string;

  @Prop({  })
  loanPurpose: string;


  @Prop({  })
  employerName: string;

  @Prop({  })
  employerPhoneNumber: string;

  @Prop()
  employerGrade?: string;

  @Prop({  min: 0 })
  monthlyIncome: number;

  @Prop({  })
  employerAddress: string;

  @Prop({  })
  state: string;

  @Prop({  })
  lga: string;

  @Prop({ default: false })
  declarationAccepted: boolean;

  @Prop({  })
  loanStatus: string;
@Prop({  })
  vendorInvoice:string
@Prop({ enum:LoanStatus,default:LoanStatus.PENDING })
  status:string
}

export const LoanSchema = SchemaFactory.createForClass(LoanModel);


LoanSchema.pre('save', async function (next) {
  this.id = randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);
  next();
});
