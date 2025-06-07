
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument,models,model } from 'mongoose';
import * as unique from 'mongoose-unique-validator'

export type AssignRoleDoc = HydratedDocument<AssignRoleModel>;

@Schema({ timestamps: true })
export class AssignRoleModel {
  @Prop({index: true, unique: true,})
  id: string;
 
  @Prop({  required: true })
  name: string;

  @Prop()
  permissions: string[];
  
  
  @Prop()
  state :string
  
  @Prop()
  description :string

  @Prop({ ref:"UserModel" })
  userID: string; 

}

export const AssignRoleSchema = SchemaFactory.createForClass(AssignRoleModel);
unique(AssignRoleSchema)
AssignRoleSchema.pre<AssignRoleModel>('save', async function (next,error) {

  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  next();
});
