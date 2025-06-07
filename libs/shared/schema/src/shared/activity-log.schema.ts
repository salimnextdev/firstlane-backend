import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityLogDoc = HydratedDocument<ActivityLogModel>;

@Schema({ timestamps: true })
export class ActivityLogModel {
  @Prop({ required: true })
  action: string; // e.g., 'create', 'update', 'delete'

  @Prop({ required: true })
  entityType: string; // e.g., 'Organization', 'User', etc.

  @Prop({ required: true })
  entityID: string; // ID of the entity affected

  @Prop({ required: true,ref:"UserModel" })
  userID: string; // ID of the user who performed the action

  @Prop({ default:false})
  isRead: boolean; // Indicates if the activity log has been read by the user
  @Prop()
  details?: string; // Optional additional details about the action
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLogModel);
