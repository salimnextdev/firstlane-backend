
import { FeeCategory, FeeStatus, FeeType } from '@app/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument,models,model } from 'mongoose';
import * as unique from 'mongoose-unique-validator'

export type FeeDoc = HydratedDocument<FeeModel>;

@Schema({ timestamps: true })
export class FeeModel {
 
 
  @Prop({default:0})
  fee: number;

  @Prop({enum:FeeType,default:FeeType.FIXED})
  feeType: string;

  @Prop({enum:FeeStatus,default:FeeStatus.ACTIVE})
  status: string;

  @Prop({enum:FeeCategory,default:FeeCategory.RECOMMENDEDPRICE})
  category: string;

  @Prop({default:0})
  minAmount: number;

  @Prop({default:0})
  maxAmount: number;
  
}

export const FeeSchema = SchemaFactory.createForClass(FeeModel);

