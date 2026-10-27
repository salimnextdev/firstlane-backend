
import { ApiProperty } from '@nestjs/swagger';

export class CurrencyDTO {
  @ApiProperty({ description: 'Unique identifier for the currency', required: false })
  _id?: string;

  @ApiProperty({ description: 'Name of the currency' })
  name: string;

  @ApiProperty({ description: 'Code of the currency' })
  code: string;

  @ApiProperty({ description: 'Symbol of the currency' })
  symbol: string;

  @ApiProperty({ description: 'Country associated with the currency' })
  country: string;

  @ApiProperty({ description: 'Indicates if the currency is active', default: true })
  isActive: boolean;
  @ApiProperty({ description: 'Logo of the currency', required: false })
  logo?: string;
  
}