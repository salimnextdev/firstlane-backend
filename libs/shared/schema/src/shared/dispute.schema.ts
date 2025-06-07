
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';

export type DisputeDoc = HydratedDocument<DisputeModel>;

@Schema({ timestamps: true })
export class DisputeModel {
  @Prop({ })
  id:string
  @Prop({ref: 'RideModel' })
  rideID: string;
  @Prop({  })
  lastMessage: string;
  @Prop({ ref: 'UserModel' })
  lastMessageBy: string;
  @Prop({ default: false })
  isRead: boolean;

  @Prop({ required: true })
  reason: string;

  @Prop({  })
  type: string;

  @Prop({ required: true, enum: ['pending', 'resolved'], default: 'pending' })
  status: string;

  @Prop()
  resolution?: string;


  @Prop({ref:"DisputeModel"})
  disputeID:string
  
  @Prop({  })
  description: string;

  @Prop({ ref: 'UserModel' })
  userID?: string;
  @Prop({ ref: 'UserModel' })
  adminID?: string;
}

export const DisputeSchema = SchemaFactory.createForClass(DisputeModel);
DisputeSchema.pre<DisputeModel>('save', async function (next,error) {

  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  next();
});
