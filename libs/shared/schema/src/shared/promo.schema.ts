
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
export type PromoDoc = HydratedDocument<PromoModel>;

@Schema({ timestamps: true })
export class PromoModel {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true, enum: ['percentage', 'fixed'], default: 'percentage' })
  type: string;

  @Prop({ required: true, default: Date.now})
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({  })
  description: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
@Prop({default:0})
  maxUse?: number;
}

export const PromoSchema = SchemaFactory.createForClass(PromoModel);
PromoSchema.plugin(uniqueValidator);