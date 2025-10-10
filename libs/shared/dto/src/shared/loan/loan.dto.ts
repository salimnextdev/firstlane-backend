import { LoanStatus, LoanType } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class LoanRepaymentDTO {
  @ApiProperty({ description: 'ID of the loan to repay' })  
   loanID: string;
  @ApiProperty({ description: 'Payment details for the repayment' })
  payment: any;
  @ApiProperty({ description: 'Reference for the repayment transaction' })
  reference: string
}
export class LoanDTO {
  @ApiProperty({
    example: 1000,
  })
  amountRequested: number;

  @ApiProperty({
    example: "purpose",
  })
  purpose: string;

  @ApiProperty({
    example: "tenure",
  })
  tenure: string;

  @ApiProperty({
    example: "repaymentInterval",
  })
  repaymentInterval: string;

  @ApiProperty({
    example: LoanType.PERSONAL,
    enum: LoanType,

  })
  loanType: string;

  @ApiProperty({
    example: "loanPurpose",
  })
  loanPurpose: string;

  @ApiProperty({
    example: "employerName",
  })
  employerName: string;

  @ApiProperty({
    example: "employerPhoneNumber",
  })
  employerPhoneNumber: string;

  @ApiProperty({
    example: "employerGrade",
  })
  employerGrade: string;

  @ApiProperty({
    example: 10000,
  })
  monthlyIncome: number;

  @ApiProperty({
    example: "employerAddress",
  })
  employerAddress: string;

  @ApiProperty({
    example: "state",
  })
  state: string;

  @ApiProperty({
    example: "lga",
  })
  lga: string;

  @ApiProperty({
    example: true,
  })
  declarationAccepted: boolean;

  @ApiProperty({
    example: "loanStatus",
  })
  loanStatus: string;

  @ApiProperty({
   example:""
  })
  id: string;

  @ApiProperty({
    example: "vendorInvoice",
  })
  vendorInvoice: string;
 @ApiProperty({
    example: "vendorAccountNumber",
  })
  vendorAccountNumber: string;
  @ApiProperty({
    example: "vendorBankName",
  })
  vendorBankName: string;
   @ApiProperty({
    example: "vendorBankCode",
  })
  vendorBankCode: string;
 @ApiProperty({
    example: "proofOfPayment",
  })
  proofOfPayment: string;
  @ApiProperty({ enum: LoanStatus, example: LoanStatus.PENDING })
  status: string;
  @ApiProperty({
    example: "6878e109730140f93d7cac1e",
  })
  userID:string

  @ApiProperty({
    example: "6878e109730140f93d7cac1e",
  })
  collateralID: string;

   @ApiProperty({
      example: "JHU098",
      description: "Staff referral code",
    })
      refCode?:string
    
}


