
import { ApiProperty } from '@nestjs/swagger';

export class PromoDTO {
  @ApiProperty({ description: 'Unique identifier for the promo', required: false })
  _id?: string;

  @ApiProperty({ description: 'Promo code', example: 'SUMMER20' })
  code: string;

  @ApiProperty({ description: 'Discount ', example: 20 })
  discount: number;

  
  @ApiProperty({ description: 'Type of promo', example: 'percentage', enum: ['percentage', 'fixed'], default: 'percentage' })
  type: string;


  @ApiProperty({ description: 'Start date of the promo', example: '2023-06-01' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the promo', example: '2023-08-31' })
  endDate: Date;

  @ApiProperty({ description: 'Description of the promo', example: 'Summer Sale - 20% off' })
  description: string;

  @ApiProperty({ description: 'Status of the promo', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @ApiProperty({ description: 'Maximum number of use', example: 50, required: false })
  maxUse?: number;
  

}
