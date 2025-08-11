
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FxRateModel } from './fxrate.schema';
import { randomInt, randomUUID } from 'crypto';

@Schema()
class BaseCurrency {
  @Prop({ type: String, ref: 'CurrencyModel' })
  currencyID: string;

  @Prop({ required: true })
  value: number;
}
@Schema()
class BankAccount {
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountName: string;
  @Prop({  })
  bankCode: string;
  @Prop({ })
  accountType: string;

  @Prop({  })
  ACHrouting: string;
  @Prop({  })
 wireRouting: string;
  @Prop({  })
  swiftCode: string;
  @Prop({  })
  currency: string;
  
}
const BaseCurrencySchema = SchemaFactory.createForClass(BaseCurrency);

@Schema({ timestamps: true })
export class FxModel {
    @Prop({  })
  id:string

  @Prop({ required: true, type: String, ref: 'UserModel' })
  userID: string;

  @Prop({ type: BaseCurrencySchema, required: true })
  fromCurrency: BaseCurrency;

  @Prop({ type: BaseCurrencySchema, required: true })
  toCurrency: BaseCurrency;

  @Prop({ type: String, ref:"FxRateModel", required: true })
  fxRateID: string;

  @Prop({ enum: ['buy', 'sell'], default: 'buy' })
  type: string;

  @Prop({ enum: ['pending', 'completed', 'failed', 'cancelled', 'suspicious'], default: 'pending' })
  status: string;

  @Prop({type:BankAccount,})
  bank:BankAccount
}

export const FxSchema = SchemaFactory.createForClass(FxModel);
FxSchema.pre<FxModel>('save', async function (next,error) {

  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  next();
});

export type FxDoc = FxModel & Document;