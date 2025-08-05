
import { ApiProperty } from '@nestjs/swagger';

class BaseCurrency{
  @ApiProperty({ description: 'Unique identifier for the currency', required: false })
  currencyID: string;
  
  @ApiProperty({ description: 'Value' })
  value: number;
}

export class FxRateDTO {
  @ApiProperty({ description: 'Unique identifier for the FX rate', required: false })
  _id?: string;

  @ApiProperty({ type:BaseCurrency, description: 'Base currency code' })
  baseCurrency: BaseCurrency;

  @ApiProperty({ type:BaseCurrency, description: 'Target currency code' })
  targetCurrency: BaseCurrency;

  @ApiProperty({ description: 'Exchange rate' })
  rate: number;

  @ApiProperty({ description: 'Date of the rate', type: Date })
  date: Date;
}