

import { ApiProperty } from "@nestjs/swagger";


export class PlatformDTO {
    @ApiProperty({ description: 'logo', required: false })
    logo: string;
    @ApiProperty({ description: 'name', required: false })
    name: string;
    @ApiProperty({ description: 'email', required: false })
    email: string;
    @ApiProperty({ description: 'phone', required: false })
    phone: string;
}

export class LoanSettingsDTO {
  @ApiProperty({ description: 'Personal loan interest rate (%)', required: false, example: 0.0 })
  personalLoanInterestRate: number;

  @ApiProperty({ description: 'Business loan interest rate (%)', required: false, example: 0.0 })
  businessLoanInterestRate: number;

  @ApiProperty({ description: 'Employee loan interest rate (%)', required: false, example: 0.0 })
  employeeLoanInterestRate: number;

  @ApiProperty({ description: 'Asset finance loan interest rate (%)', required: false, example: 0.0 })
  assetFinanceLoanInterestRate: number;

  @ApiProperty({ description: 'Minimum loan limit', required: false, example: 0.0 })
  minimumLoanLimit: number;

  @ApiProperty({ description: 'Maximum loan limit', required: false, example: 0.0 })
  maximumLoanLimit: number;

  @ApiProperty({ description: 'Maximum grace period (e.g., 30 days)', required: false, example: '30 days' })
  maximumGracePeriod: string;

  @ApiProperty({ description: 'Loan terms and agreement document name or URL', required: false, example: 'Document_name.pdf' })
  loanTermsDocument: string;

  @ApiProperty({ description: 'Enable or disable personal loan', required: false, example: true })
  enablePersonalLoan: boolean;

  @ApiProperty({ description: 'Enable or disable business loan', required: false, example: true })
  enableBusinessLoan: boolean;

  @ApiProperty({ description: 'Enable or disable employee loan', required: false, example: true })
  enableEmployeeLoan: boolean;

  @ApiProperty({ description: 'Enable or disable asset finance loan', required: false, example: true })
  enableAssetFinanceLoan: boolean;
}

export class InvestmentSettingsDTO {
  @ApiProperty({
    description: 'Available investment durations in days (comma-separated or array)',
    required: false,
    example: [90, 180, 270, 360, 540],
    isArray: true,
    type: Number,
  })
  availableDurations: number[];

  @ApiProperty({
    description: 'Investment terms and agreement document name or URL',
    required: false,
    example: 'Document_name.pdf',
  })
  investmentTermsDocument: string;
}

export class FxSettingsDTO {
  @ApiProperty({
    description: 'Minimum FX transaction amount',
    required: false,
    example: 0,
  })
  minFxTransactionLimit: number;

  @ApiProperty({
    description: 'Maximum FX transaction amount',
    required: false,
    example: 0,
  })
  maxFxTransactionLimit: number;
}

export class WalletSettingsDTO {
  @ApiProperty({
    description: 'Daily transfer limit per user',
    required: false,
    example: 0,
  })
  dailyTransferLimit: number;

  @ApiProperty({
    description: 'Supported wallet funding methods (comma separated or array)',
    required: false,
    example: ['Bank transfer', 'Card', 'USSD'],
    isArray: true,
    type: String,
  })
  supportedFundingMethods: string[];

  @ApiProperty({
    description: 'Enable or disable multi-currency wallets',
    required: false,
    example: false,
  })
  enableMultiCurrencyWallets: boolean;
}
export class SecuritySettingsDTO {
  @ApiProperty({
    description: 'Login attempt limit before lockout',
    required: false,
    example: 5,
  })
  loginAttemptLimit: number;

  @ApiProperty({
    description: 'Session timeout duration',
    required: false,
    example: '30 mins',
  })
  sessionTimeoutDuration: string;

  @ApiProperty({
    description: 'Enable Two-Factor Authentication (2FA) for admins',
    required: false,
    example: true,
  })
  enable2FAForAdmins: boolean;
}
export class SettingsDTO {
  @ApiProperty({ description: 'Unique identifier for the user', required: false })
  _id?: string;

   @ApiProperty({ description: 'Privacy policy of the platform', required: false })
  privacyPolicy?: string;
  @ApiProperty({ type: PlatformDTO, description: 'Platform details', required: false })
  plaform: PlatformDTO;

  @ApiProperty({ description: 'SMS Notification preference', required: false })
  smsNotification: boolean;

  @ApiProperty({ description: 'Email Notification preference', required: false })
  emailNotification: boolean;

  @ApiProperty({ type: LoanSettingsDTO, description: 'Loan-related platform settings', required: false })
  loanSettings: LoanSettingsDTO;

  
  @ApiProperty({ type: InvestmentSettingsDTO, description: 'Investment-related platform settings', required: false })
  investmentSettings: InvestmentSettingsDTO;

  
  @ApiProperty({ type: FxSettingsDTO, description: 'FX transaction settings', required: false })
  fxSettings: FxSettingsDTO;

  @ApiProperty({ type: WalletSettingsDTO, description: 'Wallet-related settings', required: false })
  walletSettings: WalletSettingsDTO;

  @ApiProperty({ type: SecuritySettingsDTO, description: 'Security-related settings', required: false })
  securitySettings: SecuritySettingsDTO;
}