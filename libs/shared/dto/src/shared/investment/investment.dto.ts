import { InvestmentStatus, InvestmentType } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class InvestmentDTO {
    _id?: string;
    @ApiProperty({ description: 'First name of the investor' })
    firstname: string;
    @ApiProperty({ description: 'userID of the investor' })
    userID: string;
    
    @ApiProperty({ description: 'Last name of the investor' })
    lastname: string;
    
    @ApiProperty({ description: 'Email address of the investor' })
    email: string;
    
    @ApiProperty({ description: 'Phone number of the investor', example: '08000000000' })
    phone: string;
    
    @ApiProperty({ description: 'Amount invested by the investor', minimum: 0 })
    amount: number;
    
    @ApiProperty({ description: 'Interest rate for the investment', minimum: 0, maximum: 100 })
    interestRate: number;
    
    @ApiProperty({ description: 'Type of investment', example: InvestmentType.FIXED_DEPOSIT, enum: InvestmentType })
    investmentType: string;
    
    @ApiProperty({ description: 'Due date for the investment', type: Date })
    investmentDueDate: Date;
    
    @ApiProperty({ description: 'Unique code for the investment plan' })
    code?: string;
    
    @ApiProperty({ description: 'Status of the investment plan', default: InvestmentStatus.PENDING, enum: InvestmentStatus })
    status?: string;
    
    @ApiProperty({ example:["30 days","180 days"], description: 'duration in days'  })
    durations?: string[];
@ApiProperty({ example:'30 days', description: 'duration in days'  })
    duration?: string;
     @ApiProperty({
    example: "JHU098",
    description: "Staff referral code",
  })
    refCode?:string
}
