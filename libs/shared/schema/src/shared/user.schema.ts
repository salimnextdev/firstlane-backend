import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/enum';
import { UserType } from '@app/enum/shared/ride.enum';

export type UserDoc = HydratedDocument<UserModel>;
class Vehicle {
  @Prop()
  name: string;
  @Prop()
  state: string;
  @Prop()
  model: string;

  @Prop()
  number: string;
}
class OrderItem {
  @Prop()
  item: string;

  @Prop()
  unit: number;

  @Prop()
  pricePerUnit: number;

  @Prop()
  description: string;
}
class BankAccount {
  @Prop()
  bankName: string;
  @Prop()
  accountName: string;

  @Prop()
  accountNumber: string;
  @Prop()
  customerCode: string;
  @Prop()
  bankCode: string;
  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

class Location {
  @Prop()
  address: string;

  @Prop()
  long: string;

  @Prop()
  lag: string;
}

class Verifications {
  @Prop()
  nin?: string; // National Identification Number

  @Prop()
  ninDocument?: string; // URL to uploaded NIN slip/card

  @Prop()
  driverLicense?: string; // Driver's License Number

  @Prop()
  driverLicenseDocument?: string; // URL to uploaded Driver’s License

  @Prop()
  utilityBillNumber?: string; // Utility Bill Number

  @Prop()
  utilityBillDocument?: string; // URL to uploaded Utility Bill

  @Prop({ enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  statusNinDocument?: 'pending' | 'verified' | 'rejected';

  @Prop({ enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  statusUtilityBill?: 'pending' | 'verified' | 'rejected';

  @Prop({ enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  statusDriverLicense?: 'pending' | 'verified' | 'rejected';

  @Prop()
  rejectionReasonDriverLicense?: string;
  @Prop()
  rejectionReasonUtilityBill?: string;
  @Prop()
  rejectionReasonNinDocument?: string;
  @Prop()
  rejectionReason?: string; // General rejection reason
}
class Refferal {
  @Prop()
  refCode: string;
  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status?: string;
  @Prop({ default: 10 })
  max: number;

  @Prop({ default: 0 })
  amount?: number;
}

@Schema({ timestamps: true })
export class UserModel {
  @Prop({ index: true, unique: true })
  id: string;
  @Prop({})
  playerId?: string;
  @Prop({})
  username: string;

  @Prop({ index: true, unique: true, required: true })
  email: string;

  @Prop({})
  phone: string;

  @Prop({})
  territory: string;

  @Prop({})
  fullname: string;

  @Prop({})
  password: string;

  @Prop()
  profileImage?: string;

  @Prop({ type: [String], enum: Role, default: ['user'] })
  roles: Role[];

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: 'unverified' })
  emailStatus: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: Refferal, default: { amount:0, max: 10, status: 'active' } })
  referral: Refferal;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  localGovernmentArea?: string;

  @Prop()
  postalCode?: string;

  @Prop({ type: Object })
  socialMediaProfile?: Record<string, string>;

  @Prop({ type: [{ question: String, answer: String }] })
  recoveryQuestion: { question: string; answer: string }[];

  @Prop({ type: Vehicle })
  vehicle?: Vehicle;

  @Prop({ type: [BankAccount], default: [] })
  bankAccount?: BankAccount[];

  @Prop({ type: Location })
  location?: Location;

  @Prop({ type: String, enum: UserType, default: UserType.USER })
  userType?: string;

  /** 🔹 Grouped Verification Fields */
  @Prop({ type: Verifications, default: {} })
  verifications?: Verifications;

  @Prop({ type: [OrderItem], default: [] })
  orders?: OrderItem[];

  @Prop({ index: true, unique: true })
  refCode: string;

  @Prop({ ref: 'UserModel' })
  refBy: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
UserSchema.plugin(uniqueValidator);

// **Hash Password Before Saving**
UserSchema.pre<UserModel>('save', async function (next) {
  if (this.password) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password || '123456', salt);
  }
  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);

  this.username = this.username || this.email;

  this.refCode =
    this.username.substring(0, 2) +
    randomInt(99) +
    randomUUID().substring(0, 2);
  this.referral.refCode = this.refCode;
  next();
});
