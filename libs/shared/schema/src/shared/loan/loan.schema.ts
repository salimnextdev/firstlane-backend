import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
// Optionally, add ID generator middleware
import { randomInt, randomUUID } from "crypto";
import { LoanStatus, LoanType } from "@app/enum";
import * as moment from "moment";
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
  bankStatement: string;
  @Prop({  })
  tenure: string;

  @Prop({ enum:["Daily","Weekly","Monthly","Quarterly","Yearly"],default:"Monthly" })
  repaymentInterval: string;

  @Prop({ enum:LoanType })
  loanType: string;

  @Prop({  })
  loanPurpose: string;
@Prop({ default:5  })
  interest: number;


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

  @Prop({ref:"CollateralModel"})
  collateralID: string;

  @Prop({ ref:"UserModel"})
  refBy?:string
  @Prop({  })
  vendorAccountNumber: string;
  @Prop({  })
  vendorBankName: string;
  @Prop({  })
  vendorBankCode: string;
  @Prop({  })
  proofOfPayment: string;
@Prop({
    type: [
      {
        id: Number,
        date: Date,
        amount: Number,
        paidAt: Date,
        status: { type: String, enum: ["pending", "paid"], default: "pending" },
      },
    ],
    default: [],
  })
  payments: { paidAt: Date, id: number; date: Date; amount: number; status: "pending" | "paid" }[];

  @Prop({  })
  totalRepayable:number

@Prop({  })
  totalInterest:number
@Prop()
tenureValue: number; // e.g. 12

@Prop({ enum: ['days', 'months', 'years'] })
tenureUnit: string;
}

export const LoanSchema = SchemaFactory.createForClass(LoanModel);


LoanSchema.pre('save', async function (next) {
  if(this.isNew ){
  this.id = randomInt(100, 999) + randomUUID().replace(/\D/g, "").substring(0, 3);
  const principal = this.amountRequested;
    const interestRate = this.interest || 10; // %
    const totalInterest = (principal * interestRate) / 100;
    const totalRepayable = principal + totalInterest;
 const tenureString = this.tenure?.toLowerCase() || '';
 const [tenureValueStr, tenureUnitRaw] = tenureString.split(' ');
    const tenureValue = parseInt(tenureValueStr, 10);
    const tenureUnit = tenureUnitRaw?.includes('day')
      ? 'days'
      : tenureUnitRaw?.includes('year')
      ? 'years'
      : 'months';
      this.tenureValue = tenureValue;
      this.tenureUnit = tenureUnit;
  
    // Determine number of payments
    let numPayments = 0;
    if (this.repaymentInterval === "Daily") numPayments  = moment.duration(tenureValue, tenureUnit).asDays();;
    if (this.repaymentInterval === "Weekly") numPayments = moment.duration(tenureValue, tenureUnit).asWeeks();
    if (this.repaymentInterval === "Monthly") numPayments = tenureUnit === 'months' ? tenureValue : moment.duration(tenureValue, tenureUnit).asMonths();;
    if (this.repaymentInterval === "Quarterly") numPayments = tenureUnit === 'months' ? tenureValue / 3 : moment.duration(tenureValue, tenureUnit).asMonths() / 3;
    if (this.repaymentInterval === "Yearly") numPayments = tenureUnit === 'years' ? tenureValue/ 12 : moment.duration(tenureValue, tenureUnit).asYears();

    const paymentAmount = Number((totalRepayable / numPayments).toFixed(2));
console.log(numPayments)
    // Use createdAt if available, else now
    const startDate =  moment();

    const payments = [];
    for (let i = 1; i <= numPayments; i++) {
      let paymentDate = startDate.clone();
      if (this.repaymentInterval === "Daily") paymentDate = paymentDate.add(i, "days");
      if (this.repaymentInterval === "Weekly") paymentDate = paymentDate.add(i, "weeks");
      if (this.repaymentInterval === "Monthly") paymentDate = paymentDate.add(i, "months");
      if (this.repaymentInterval === "Quarterly") paymentDate = paymentDate.add(i * 3, "months");
       if (this.repaymentInterval === "Yearly") paymentDate = paymentDate.add(i * 12, "months");

      payments.push({
        id: i,
        date: paymentDate.toDate(),
        amount: paymentAmount,
        status: "pending",
      });
    }

    this.payments = payments;
  
  }
  next();
});
