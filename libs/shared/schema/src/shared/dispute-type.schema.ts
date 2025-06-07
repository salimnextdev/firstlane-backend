import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export type DisputeTypeDoc = HydratedDocument<DisputeTypeModel>;

@Schema({ timestamps: true })
export class DisputeTypeModel {
  
  @Prop({  })
  name: string;

  @Prop({  })
  description: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}
export const DisputeTypeSchema = SchemaFactory.createForClass(DisputeTypeModel);