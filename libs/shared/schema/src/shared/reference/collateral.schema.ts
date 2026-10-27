import { AppTypeEnum } from "@app/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CollateralDoc = CollateralModel & Document;

@Schema({ timestamps: true })
export class CollateralModel {

  @Prop()
  name: string;
@Prop()
  value: number;
  @Prop({ enum:AppTypeEnum })
  type: string;


  @Prop({ref:"UserModel"})
  userID: string;
}

export const CollateralSchema = SchemaFactory.createForClass(CollateralModel);


