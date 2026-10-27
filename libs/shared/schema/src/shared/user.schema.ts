import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomInt, randomUUID } from "crypto";
import { HydratedDocument } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
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

export type UserDoc = HydratedDocument<UserModel>;

class BankAccount {
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
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
  @Prop({  })
  currency: string;
  
}

class NextOfKin {
  @Prop({ required: true, enum: Title })
  title: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  relationship: string;

  @Prop({ required: true, enum: Gender })
  gender: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  residentialAddress: string;
}

class BankStatement {
  @Prop({ required: true })
  documentUrl: string;

  @Prop({ required: true })
  statementDate: string;

  @Prop({
    required: true,
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

class Verifications {
  @Prop({ required: true, enum: IdType })
  idType: string;

  @Prop({ required: true })
  idNumber: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ required: true })
  bvn: string;

  @Prop({
    required: true,
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: string;

  @Prop()
  documentUrl?: string;

  @Prop()
  notes?: string;

    @Prop()
  utilityBill?: string;

    @Prop()
  waterBill?: string;

  @Prop()
  verifiedAt?: Date;

  @Prop({ type: NextOfKin, required: true })
  nextOfKin: NextOfKin;

  @Prop({ default: false })
  isKycComplete?: boolean;

  @Prop()
  kycCompletedAt?: Date;

  @Prop({ enum: KycLevel, default: KycLevel.LEVEL1 })
  kycLevel?: string;

  @Prop({ type: [BankStatement] })
  bankStatements?: BankStatement[];

  @Prop({ min: 0, max: 6, default: 0 })
  totalBankStatements?: number;
}

class Referral {
  @Prop({ required: true })
  refCode: string;

  @Prop({ enum: ["active", "inactive"] })
  status?: string;

  @Prop({ required: true })
  max: number;

  @Prop({ default: 0 })
  amount: number;
}
@Schema({ timestamps: true })
export class UserModel {
  @Prop()
  id: string;
  
  @Prop()
  title?: string;
  @Prop()
  playerId?: string;

  @Prop({ type: [String] })
  roles: string[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: String, enum: UserType, default: UserType.USER })
  userType: string;

  @Prop()
  username?: string;

  @Prop({enum:UserStatus, default:UserStatus.ACTIVE})
  status?: string;

  @Prop()
  emailStatus?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  profileImage?: string;

  @Prop({ default: false })
  isAdmin?: boolean;

  @Prop({ default: false })
  isSuperAdmin?: boolean;

  @Prop()
  dob?: Date;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  gender?: string;

  @Prop()
  localGovernmentArea?: string;

  @Prop({ enum: MaritalStatus })
  maritalStatus?: string;

  @Prop({ type: Object })
  socialMediaProfile?: Record<string, string>;

  @Prop()
  residentialAddress?: string;

  @Prop({ type: [BankAccount] })
  bankAccount?: BankAccount[];

  @Prop({ type: Verifications })
  verifications?: Verifications;

  @Prop({ type: Referral })
  referral: Referral;

  @Prop()
  refBy: string;

  @Prop()
  refCode: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
UserSchema.plugin(uniqueValidator);

// **Hash Password Before Saving**
UserSchema.pre<UserModel>("save", async function (next) {
  if (this.password) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password || "123456", salt);
  }
  this.id = randomInt(99999) + randomUUID().replace(/\D/g, "").substring(0, 5);

  this.username = this.username || this.email;

  this.referral.refCode =
    this.username.substring(0, 2) +
    randomInt(99) +
    randomUUID().substring(0, 2);
this.refCode= this.referral.refCode;

  this.referral.status = "active";
  next();
});
