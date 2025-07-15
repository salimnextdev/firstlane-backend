import { LoanStatus, LoanType } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class LoanDTO {
  @ApiProperty({
    example: "amountRequested",
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
    example: "monthlyIncome",
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
    example: "declarationAccepted",
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
  @ApiProperty({ enum: LoanStatus, example: LoanStatus.PENDING })
  status: string;
  @ApiProperty({
    example: "userID",
  })
  userID:string
}


