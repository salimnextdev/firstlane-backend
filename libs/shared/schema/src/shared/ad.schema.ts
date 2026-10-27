
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdDoc = HydratedDocument<AdModel>;

@Schema({ timestamps: true })
export class AdModel {
  @Prop({ required: true })
  title: string;

  @Prop({  })
  description: string;

  @Prop({ })
  imageUrl: string;
  @Prop({ })
  location: string;
  @Prop({  })
  linkUrl: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const AdSchema = SchemaFactory.createForClass(AdModel);
