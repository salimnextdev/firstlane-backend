import { RepaymentIntervalIDays, UserInvestmentStatus } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class UserInvestmentDTO {
  @ApiProperty({
    example: "userID",
    description: "The ID of the user who owns the investment",
  })
  userID: string;

  @ApiProperty({
    example: "investmentID",
    description: "The ID of the investment plan",
  })
  investmentID: string;
     @ApiProperty({
    example: "JHU098",
    description: "Staff referral code",
  })
    refCode?:string

  @ApiProperty({
    example: 1000,
    description: "The amount invested by the user",
    minimum: 0,
  })
  amount: number;

  @ApiProperty({
    example: "active",
    description: "The status of the user's investment",
    enum: UserInvestmentStatus,
    default: UserInvestmentStatus.ACTIVE,
  })
  status?: string;

  @ApiProperty({
    example: "2024-12-31T23:59:59.999Z",
    description: "The date the investment matures",
    type: Date,
  })
  maturityDate?: Date;
  @ApiProperty({
    example: "30days",
  })
  duration?: string;

  @ApiProperty({
    example: 10,
    description: "The interest rate for this specific investment",
    minimum: 0,
    maximum: 100,
  })
  interestRate?: number;

  @ApiProperty({
    example: 1100,
    description: "The total return expected from the investment",
    minimum: 0,
  })
  expectedReturn?: number;

  @ApiProperty({
    example: 100,
    description: "The amount of interest earned so far",
    minimum: 0,
  })
  interestEarned?: number;

  @ApiProperty({
    example: "INV-XYZ-123",
    description: "A unique code for the user's investment",
  })
  investmentCode?: string;

  @ApiProperty({  
   
    description:"The interval at which repayments are made in days"
  })
  repaymentInterval?: string;

   @ApiProperty({ description: 'Due date for the investment', type: Date })
    investmentDueDate: Date;
}
