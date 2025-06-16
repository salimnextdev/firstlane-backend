import {
  UserModel,
  UserSchema,
  AssignRoleModel,
  AssignRoleSchema,
  ActivityLogModel,
  ActivityLogSchema,
  AuthenticatorModel,
  AuthenticatorSchema,
  OTPModel,
  OTPSchema,
  FeeModel,
  FeeSchema,
  ChatModel,
  ChatSchema,
  AdModel,
  AdSchema,
  PromoModel,
  PromoSchema,
  DisputeModel,
  DisputeSchema,
  DisputeTypeModel,
  DisputeTypeSchema,
  CountryModel,
  CountrySchema,
  StateModel,
  StateSchema,
  InvestmentPlanModel,
  InvestmentPlanSchema,
  InvestmentModel,
  InvestmentSchema,
  UserInvestmentModel,
  UserInvestmentSchema,
} from '@app/schema';
import { RideModel, RideSchema } from '@app/schema/shared/ride.schema';
import { TransactionModel, TransactionSchema } from '@app/schema/shared/transaction.schema';
import { WalletModel, WalletSchema } from '@app/schema/shared/waller.schema';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const { MONGODB_URL, environment } = process.env;
const DBLINK =
  environment === 'production'
    ? MONGODB_URL
    : 'mongodb://localhost:27017/firstlane';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
    MongooseModule.forRoot(DBLINK),
MongooseModule.forFeature([
      { name: InvestmentPlanModel.name, schema: InvestmentPlanSchema },
    ]),
    MongooseModule.forFeature([
      { name: InvestmentModel.name, schema: InvestmentSchema },
    ]),

    MongooseModule.forFeature([
      { name: UserInvestmentModel.name, schema: UserInvestmentSchema },
    ]),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: AssignRoleModel.name, schema: AssignRoleSchema },
    ]),
    MongooseModule.forFeature([
      { name: ActivityLogModel.name, schema: ActivityLogSchema },
    ]),

    MongooseModule.forFeature([
      { name: AuthenticatorModel.name, schema: AuthenticatorSchema },
    ]),
    MongooseModule.forFeature([{ name: OTPModel.name, schema: OTPSchema }]),
    MongooseModule.forFeature([{ name: RideModel.name, schema: RideSchema }]),
    MongooseModule.forFeature([{ name: FeeModel.name, schema: FeeSchema }]),
    MongooseModule.forFeature([{ name: ChatModel.name, schema: ChatSchema }]),

    MongooseModule.forFeature([{ name:AdModel.name, schema:AdSchema }]),
    MongooseModule.forFeature([{ name: TransactionModel.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name:WalletModel.name, schema:WalletSchema }]),
    MongooseModule.forFeature([{ name: PromoModel.name, schema: PromoSchema }]),
    MongooseModule.forFeature([{ name: DisputeModel.name, schema: DisputeSchema }]),
    MongooseModule.forFeature([{ name: StateModel.name, schema: StateSchema }]),
    MongooseModule.forFeature([{ name: CountryModel.name, schema: CountrySchema }]),
    MongooseModule.forFeature([
      { name: DisputeTypeModel.name, schema: DisputeTypeSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class GlobalMongooseModule {}
