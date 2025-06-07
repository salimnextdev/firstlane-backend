import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument,models,model } from 'mongoose';
import * as unique from 'mongoose-unique-validator'

export type AuthenticatorDoc = HydratedDocument<AuthenticatorModel>;

@Schema({ timestamps: true })
export class AuthenticatorModel {
 
 
  @Prop({index: true, unique: true})
  secret: string;

  @Prop({default:"active"})
  status: string;

  @Prop({index: true, unique: true,ref:"UserModel"})
  userID: string
  
}

export const AuthenticatorSchema = SchemaFactory.createForClass(AuthenticatorModel);
unique(AuthenticatorSchema)
AuthenticatorSchema.pre<AuthenticatorModel>('save', async function (next,error) {

  
  next();
});
