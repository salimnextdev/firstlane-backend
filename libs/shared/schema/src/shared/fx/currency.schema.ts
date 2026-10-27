
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({  timestamps: true })
export class CurrencyModel  {
  @Prop({  })
  name: string;

  @Prop({  })
  code: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({  })
  country: string;

  @Prop({ default: true })
  isActive: boolean;
 @Prop({  })
  logo:string
}

export const CurrencySchema = SchemaFactory.createForClass(CurrencyModel);

export type CurrencyDoc = CurrencyModel & Document;