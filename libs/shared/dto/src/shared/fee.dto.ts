

import { FeeCategory, FeeStatus, FeeType } from '@app/enum';
import { ApiProperty } from '@nestjs/swagger';

export class FeeDTO {
  @ApiProperty({ description: 'Unique identifier for the fee', required: false })
  _id?: string;

  @ApiProperty({ description: 'Fee amount', example: 10.5 })
  fee: number;

  @ApiProperty({
    description: 'Type of fee',
    enum: FeeType,
    example: 'fixed',
    default: FeeType.FIXED,
  })
  feeType: string;

  @ApiProperty({
    description: 'Status of the fee',
    enum: FeeStatus,
    example: 'active',
    default: FeeStatus.ACTIVE,
  })
  status: string;

  @ApiProperty({
    description: 'Category of the fee',
    enum: FeeCategory,
    example: 'recommended-price',
    default: FeeCategory.RECOMMENDEDPRICE,
  })
  category: string;

  @ApiProperty({ description: 'Minimum ', example: 0 })
  minAmount: number;

  @ApiProperty({ description: 'Maximum ', example: 100 })
  maxAmount: number;


}
