
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDoc = HydratedDocument<ChatModel>;

@Schema({ timestamps: true })
export class ChatModel {
  @Prop({ required: true, ref: 'UserModel' })
  senderID: string;

  @Prop({ required: true, ref: 'RideModel' })
  rideID: string;
  // @Prop({ required: true, ref: 'UserModel' })
  // receiverID: string;

  
  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text',
  })
  messageType: string;

  @Prop({
    required: true,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  })
  status: string;

  @Prop({ default: false })
  isSystemMessage: boolean;

  @Prop()
  mediaUrl?: string;
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);
