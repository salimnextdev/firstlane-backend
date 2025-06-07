import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDoc = HydratedDocument<TransactionModel>;

@Schema({ timestamps: true })
export class TransactionModel {
  @Prop({  ref: 'UserModel' })
  
    userID: string;
  
    @Prop()
    email?: string;

  
    @Prop({ })
    customerCode: string;
  
    @Prop({ default: 0 })
    balance: number;
  
    @Prop({  default: 'NGN' })
    currency: string;
  
    @Prop({ default: 'pending' })
    status?: string;

     @Prop({ })
    reference: string;
    @Prop({ })
    amount: number;
    @Prop({ })
    message: string;

    @Prop({ })
    sender_bank_account_number: string;
    @Prop({ })
    narration: string;
    @Prop({ })
    sender_bank:string;
    @Prop({ })
    card_type: string;
    @Prop({ })
    type: string;

  }
 

export const TransactionSchema = SchemaFactory.createForClass(TransactionModel);
