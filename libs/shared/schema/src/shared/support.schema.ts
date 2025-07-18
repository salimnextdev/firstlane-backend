
  
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupportDoc = HydratedDocument<SupportModel>;

@Schema({ timestamps: true })
export class SupportModel {
  @Prop({ ref: 'UserModel' })
  userID: string;

  @Prop({ ref: 'UserModel' })
  adminID: string;

  @Prop({  })
  subject: string;
  @Prop({  })
  supportID:string;
  @Prop({  })
  description: string;

  @Prop({ enum: ['open', 'closed', 'pending'], default: 'open' })
  status: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'low' })
  priority: string;

  @Prop()
  message?: string;

  @Prop()
  url?: string;
}

export const SupportSchema = SchemaFactory.createForClass(SupportModel);
