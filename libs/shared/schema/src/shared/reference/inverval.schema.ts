import { AppTypeEnum } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type IntervalDoc = IntervalModel & Document;

@Schema({ timestamps: true })
export class IntervalModel {

  @Prop()
  name: string;

  @Prop({ enum:AppTypeEnum })
  type: string;

}

export const IntervalSchema = SchemaFactory.createForClass(IntervalModel);


