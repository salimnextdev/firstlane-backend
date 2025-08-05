
import { ApiProperty } from '@nestjs/swagger';
import { FxRateDTO } from './fxrate.dto';

class BaseCurrency{
  @ApiProperty({ description: 'Unique identifier for the currency', required: false })
  currencyID: string;
  
  @ApiProperty({ description: 'Value' })
  value: number;
}

export class FxDTO {
  @ApiProperty({ description: 'Unique identifier for the FX transaction', required: false })
  _id?: string;

  @ApiProperty({ description: 'User ID initiating the transaction' })
  userID: string;

 @ApiProperty({ type: BaseCurrency, description: 'From currency code' })
  fromCurrency: BaseCurrency;
 @ApiProperty({ type: BaseCurrency, description: 'To currency code' })
  toCurrency: BaseCurrency;


    @ApiProperty({ type:FxRateDTO, description: 'Base currency code' })
  fxRate: FxRateDTO;             

  
  @ApiProperty({ description: 'Status of the transaction', enum: ['pending', 'completed', 'failed', 'cancelled','suspicious'], default: 'pending' })
  status: string;
}