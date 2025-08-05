
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { Document, Types } from 'mongoose';

@Schema()
class BaseCurrency {
  @Prop({ type: String, ref: 'CurrencyModel' })
  currencyID: string;

  @Prop({ required: true })
  value: number;
}
const BaseCurrencySchema = SchemaFactory.createForClass(BaseCurrency);

@Schema({ timestamps: true })
export class FxRateModel {
  @Prop({  })
  id:string

  @Prop({ type: BaseCurrencySchema, required: true })
  baseCurrency: BaseCurrency;

  @Prop({ type: BaseCurrencySchema, required: true })
  targetCurrency: BaseCurrency;

  @Prop({ required: true })
  rate: number;

 
}

export const FxRateSchema = SchemaFactory.createForClass(FxRateModel);
FxRateSchema.pre<FxRateModel>('save', async function (next,error) {

  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  next();
});

export type FxRateDoc = FxRateModel & Document;