import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDoc = HydratedDocument<WalletModel>;

@Schema({ timestamps: true })
export class WalletModel {
  @Prop({  ref: 'UserModel' })
    userID: string;
   @Prop()
    barter_id:string
    @Prop()
    email?: string;
  
    @Prop({ })
    accountName: string;
  
    @Prop({  })
    accountNumber: string;
  
    @Prop({ })
    bankName: string;
  
    @Prop({ })
    bankCode: string;
  
    @Prop({ })
    customerCode: string;
  
    @Prop({ default: 0 })
    balance: number;
  
    @Prop({  default: 'NGN' })
    currency: string;
  
    @Prop({ default: 'active' })
    status?: string;
  }
 

export const WalletSchema = SchemaFactory.createForClass(WalletModel);
