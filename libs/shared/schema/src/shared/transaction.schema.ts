import { TransactionStatus, TransactionType } from '@app/enum';
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
  
    @Prop({ })
    balance: number;
  
    @Prop({  default: 'NGN' })
    currency: string;
  
    @Prop({ default: TransactionStatus.PENDING,enum: TransactionStatus })
    status?: string;

     @Prop({ })
    reference: string;
     @Prop({ })
    action: string;
    @Prop({default:0 })
    amount: number;
    @Prop({ })
    message: string;

    @Prop({ })
    senderAccountNumber: string;
     @Prop({ })
    receiverAccountNumber: string;
    @Prop({ })
    narration: string;
    @Prop({ })
    senderBank:string;
     @Prop({ })
    receiverBank: string;
    @Prop({ })
    card_type: string;
    @Prop({ default: TransactionType.LOAN,enum: TransactionType })
    type: string;

  }
 

export const TransactionSchema = SchemaFactory.createForClass(TransactionModel);
