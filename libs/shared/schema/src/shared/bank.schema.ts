import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
import { HydratedDocument } from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";
import * as bcrypt from "bcrypt";
import {
  Gender,
  IdType,
  KycLevel,
  MaritalStatus,
  Role,
  Title,
  VerificationStatus,
} from "@app/enum";
import { UserStatus, UserType } from "@app/enum/shared/user.enum";
import { Refferal } from "@app/dto";

export type BankAccountDoc = HydratedDocument<BankAccountModel>;

@Schema({ timestamps: true })
export class BankAccountModel {
  @Prop({  })
  bankName: string;

  @Prop({  })
  accountNumber: string;

  @Prop({  })
  accountName: string;
  @Prop({  })
  bankCode: string;
  @Prop({ })
  accountType: string;

  @Prop({  })
  ACHrouting: string;
  @Prop({  })
 wireRouting: string;
  @Prop({  })
  swiftCode: string;
  @Prop({ ref:"CurrencyModel"  })
  currencyID: string;
  @Prop({  })
  id: string;

  @Prop({  ref: "UserModel" })
  userID: string;
}




export const BankAccountSchema = SchemaFactory.createForClass(BankAccountModel);

BankAccountSchema.pre<BankAccountModel>("save", async function (next) {
 
  this.id = randomInt(99999) + randomUUID().replace(/\D/g, "").substring(0, 5);

 
});
