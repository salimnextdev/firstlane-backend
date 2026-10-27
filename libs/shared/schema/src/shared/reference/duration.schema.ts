import { AppTypeEnum } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DurationDoc = DurationModel & Document;

@Schema({ timestamps: true })
export class DurationModel {

  @Prop()
  name: string;

  @Prop({ enum:AppTypeEnum })
  type: string;

}

export const DurationSchema = SchemaFactory.createForClass(DurationModel);


