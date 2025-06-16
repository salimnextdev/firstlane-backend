import { InvestmentStatus, InvestmentType } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class InvestmentPlanDTO {
    _id?: string;
   
    
    @ApiProperty({ description: 'Minimium Amount to invest', minimum: 0 })
    minAmount: number;
    
    @ApiProperty({ description: 'Interest rate for the investment', minimum: 0, maximum: 100 })
    interestRate: number;
    
    @ApiProperty({ description: 'Type of investment', example: InvestmentType.FIXED_DEPOSIT, enum: InvestmentType })
    investmentType: string;
    
    @ApiProperty({ description: 'Due date for the investment', type: Date })
    investmentDueDate: Date;
    
    @ApiProperty({ example:["30 days","180 days"], description: 'duration in days'  })
    duration?: string[];
    
    @ApiProperty({ description: 'Status of the investment plan', default: InvestmentStatus.PENDING, enum: InvestmentStatus })
    status?: string;
    
    userIDs?: string[];
    userID?: string;

}
