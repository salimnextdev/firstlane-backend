import { AppTypeEnum } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PurposeDoc = PurposeModel & Document;

@Schema({ timestamps: true })
export class PurposeModel {

  @Prop()
  name: string;

  @Prop({ enum:AppTypeEnum })
  type: string;

}

export const PurposeSchema = SchemaFactory.createForClass(PurposeModel);


