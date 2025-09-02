import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Platform {
  @Prop({ required: false })
  logo?: string;

  @Prop({ required: false })
  name?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  phone?: string;
}


@Schema()
export class LoanSettings {
  @Prop({ required: false, default: 0 })
  personalLoanInterestRate?: number;

  @Prop({ required: false, default: 0 })
  businessLoanInterestRate?: number;

  @Prop({ required: false, default: 0 })
  employeeLoanInterestRate?: number;

  @Prop({ required: false, default: 0 })
  assetFinanceLoanInterestRate?: number;

  @Prop({ required: false, default: 0 })
  minimumLoanLimit?: number;

  @Prop({ required: false, default: 0 })
  maximumLoanLimit?: number;

  @Prop({ required: false })
  maximumGracePeriod?: string;

  @Prop({ required: false })
  loanTermsDocument?: string;

  @Prop({ required: false, default: false })
  enablePersonalLoan?: boolean;

  @Prop({ required: false, default: false })
  enableBusinessLoan?: boolean;

  @Prop({ required: false, default: false })
  enableEmployeeLoan?: boolean;

  @Prop({ required: false, default: false })
  enableAssetFinanceLoan?: boolean;
}


@Schema()
export class InvestmentSettings {
  @Prop({ type: [Number], required: false, default: [] })
  availableDurations?: number[];

  @Prop({ required: false })
  investmentTermsDocument?: string;
}


@Schema()
export class FxSettings {
  @Prop({ required: false, default: 0 })
  minFxTransactionLimit?: number;

  @Prop({ required: false, default: 0 })
  maxFxTransactionLimit?: number;
}


@Schema()
export class WalletSettings {
  @Prop({ required: false, default: 0 })
  dailyTransferLimit?: number;

  @Prop({ type: [String], required: false, default: [] })
  supportedFundingMethods?: string[];

  @Prop({ required: false, default: false })
  enableMultiCurrencyWallets?: boolean;
}


@Schema()
export class SecuritySettings {
  @Prop({ required: false, default: 5 })
  loginAttemptLimit?: number;

  @Prop({ required: false, default: '30 mins' })
  sessionTimeoutDuration?: string;

  @Prop({ required: false, default: false })
  enable2FAForAdmins?: boolean;
}


@Schema({ timestamps: true })
export class SettingsModel {
  @Prop({ required: false })
  privacyPolicy?: string;

  @Prop({ type: Platform, required: false })
  plaform?: Platform;

  @Prop({ required: false, default: false })
  smsNotification?: boolean;

  @Prop({ required: false, default: false })
  emailNotification?: boolean;

  @Prop({ type: LoanSettings, required: false })
  loanSettings?: LoanSettings;

  @Prop({ type: InvestmentSettings, required: false })
  investmentSettings?: InvestmentSettings;

  @Prop({ type: FxSettings, required: false })
  fxSettings?: FxSettings;

  @Prop({ type: WalletSettings, required: false })
  walletSettings?: WalletSettings;

  @Prop({ type: SecuritySettings, required: false })
  securitySettings?: SecuritySettings;
}

export type SettingsDoc = SettingsModel & Document;

export const SettingsSchema = SchemaFactory.createForClass(SettingsModel);
