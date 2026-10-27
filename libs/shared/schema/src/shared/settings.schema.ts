import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Platform {
  @Prop({  })
  logo?: string;

  @Prop({  })
  name?: string;

  @Prop({  })
  email?: string;

  @Prop({  })
  phone?: string;
}


@Schema()
export class LoanSettings {
  @Prop({  default: 0 })
  personalLoanInterestRate?: number;

  @Prop({  default: 0 })
  businessLoanInterestRate?: number;

  @Prop({  default: 0 })
  employeeLoanInterestRate?: number;

  @Prop({  default: 0 })
  assetFinanceLoanInterestRate?: number;

  @Prop({  default: 0 })
  minimumLoanLimit?: number;

  @Prop({  default: 0 })
  maximumLoanLimit?: number;

  @Prop({  })
  maximumGracePeriod?: string;

  @Prop({  })
  loanTermsDocument?: string;

  @Prop({  default: false })
  enablePersonalLoan?: boolean;

  @Prop({  default: false })
  enableBusinessLoan?: boolean;

  @Prop({  default: false })
  enableEmployeeLoan?: boolean;

  @Prop({  default: false })
  enableAssetFinanceLoan?: boolean;
}


@Schema()
export class InvestmentSettings {
  @Prop({ type: [Number],  default: [] })
  availableDurations?: number[];

  @Prop({  })
  investmentTermsDocument?: string;
}


@Schema()
export class FxSettings {
  @Prop({  default: 0 })
  minFxTransactionLimit?: number;

  @Prop({  default: 0 })
  maxFxTransactionLimit?: number;
}


@Schema()
export class WalletSettings {
  @Prop({  default: 0 })
  dailyTransferLimit?: number;

  @Prop({ type: [String],  default: [] })
  supportedFundingMethods?: string[];

  @Prop({  default: false })
  enableMultiCurrencyWallets?: boolean;
}


@Schema()
export class SecuritySettings {
  @Prop({  default: 5 })
  loginAttemptLimit?: number;

  @Prop({  default: '30 mins' })
  sessionTimeoutDuration?: string;

  @Prop({  default: false })
  enable2FAForAdmins?: boolean;
}


@Schema({ timestamps: true })
export class SettingsModel {
  @Prop({  })
  privacyPolicy?: string;

  @Prop({ type: Platform,  })
  plaform?: Platform;

  @Prop({  default: false })
  smsNotification?: boolean;

  @Prop({  default: false })
  emailNotification?: boolean;

  @Prop({ type: LoanSettings,  })
  loanSettings?: LoanSettings;

  @Prop({ type: InvestmentSettings,  })
  investmentSettings?: InvestmentSettings;

  @Prop({ type: FxSettings,  })
  fxSettings?: FxSettings;

  @Prop({ type: WalletSettings,  })
  walletSettings?: WalletSettings;

  @Prop({ type: SecuritySettings,  })
  securitySettings?: SecuritySettings;
}

export type SettingsDoc = SettingsModel & Document;

export const SettingsSchema = SchemaFactory.createForClass(SettingsModel);
