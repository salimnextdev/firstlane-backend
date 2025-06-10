import { Gender, Role } from '@app/enum';
import { UserType } from '@app/enum/shared/ride.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserIDDTO {
  @ApiProperty({ description: 'user_id ' })
  userID: string;
  @ApiProperty({ description: 'email ' })
  email: string;
  @ApiProperty({ description: 'Type of OTP' })
  type: string;
}


export class BankAccountDTO {
  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;
  @ApiProperty({ description: 'Account name' })
  accountName: string;
}

export class ChangePasswordDTO {
  @ApiProperty({ description: 'current password' })
  currentPassword: string;
  @ApiProperty({ description: 'new passsword' })
  newPassword: string;
}

export class DeleteAccountDTO {
  @ApiProperty({ description: 'current password' })
  email: string;
  @ApiProperty({ description: 'new passsword' })
  reason: string;
}

export class ForgotPasswordDTO {
  @ApiProperty({ description: 'code' })
  code?: string;
  // @ApiProperty({ description: 'token',  })
  // token?:string
  @ApiProperty({ description: 'new passsword' })
  newPassword: string;
}

export class SetAuthenticatorDto {
  @ApiProperty({ description: 'user_id' })
  userID: String;
  @ApiProperty({ description: 'secret' })
  secret: String;
}
export class NextOfKinDTO {
  @ApiProperty({ description: 'Title of next of kin', enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.'] })
  title: string;

  @ApiProperty({ description: 'First name of next of kin' })
  firstName: string;

  @ApiProperty({ description: 'Last name of next of kin' })
  lastName: string;

  @ApiProperty({ description: 'Relationship to next of kin' })
  relationship: string;

  @ApiProperty({ description: 'Gender of next of kin', enum: ['male', 'female', 'other'] })
  gender: string;

  @ApiProperty({ description: 'Phone number of next of kin', example: '08000000000' })
  phoneNumber: string;

  @ApiProperty({ description: 'Residential address of next of kin' })
  residentialAddress: string;
}
export class VerifyAuthenticationDto {
  @ApiProperty({ description: 'user_id' })
  userID: String;
  // @ApiProperty({ description: 'token',  })
  // token: String
  @ApiProperty({ description: 'code' })
  code: String;
  @ApiProperty({ description: 'Type of OTP' })
  type: string;
}
export class BankStatementDTO {
  @ApiProperty({ description: 'Document URL for the bank statement' })
  documentUrl: string;

  @ApiProperty({ description: 'Month and year of the statement', example: '2023-01' })
  statementDate: string;

  @ApiProperty({ description: 'Status of document verification', enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Upload date of the statement' })
  uploadedAt: Date;
}
export class VerificationsDTO {
  @ApiProperty({ description: 'Type of ID document', enum: ['passport', 'drivers_license', 'national_id', 'voter_card'] })
  idType: string;
  @ApiProperty({ description: 'ID document number' })
  idNumber: string;

  @ApiProperty({ description: 'Date when ID was issued', example: '2020-01-01' })
  issueDate: Date;

  @ApiProperty({ description: 'Date when ID expires', example: '2025-01-01' })
  expiryDate: Date;

  @ApiProperty({ description: 'Bank verification number' })
  bvn: string;

  @ApiProperty({ description: 'Status of verification', enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  status: string;

  @ApiProperty({ description: 'URL to uploaded ID document image', required: false })
  documentUrl?: string;

  @ApiProperty({ description: 'Additional verification notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'Date when verification was completed', required: false })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Next of kin information' })
  nextOfKin: NextOfKinDTO;

  @ApiProperty({ description: 'Whether KYC verification is complete', default: false })
  isKycComplete?: boolean;

  @ApiProperty({ description: 'Date when KYC was completed', required: false })
  kycCompletedAt?: Date;

  @ApiProperty({ description: 'KYC verification level', enum: ['level1', 'level2', 'level3'], default: 'level1' })
  kycLevel?: string;

  @ApiProperty({ 
    description: 'Bank statements for the last 6 months',
    type: [BankStatementDTO],
    required: false
  })
  bankStatements?: BankStatementDTO[];

  @ApiProperty({ description: 'Total number of bank statements uploaded', minimum: 0, maximum: 6 })
  totalBankStatements?: number;
}
export class RefreshTokenDTO {
  @ApiProperty({ description: 'refresh_token:' })
  refresh_token: String;
}



export class Refferal {
  @ApiProperty({ description: 'referral code' })
  refCode: string;
  @ApiProperty({ description: 'status', enum: ['active', 'inactive'] })
  status?: string;
  @ApiProperty({ description: 'max referal' })
  max: number;

  @ApiProperty({ description: 'amount', default: 0 })
  amount: number;
}



export class UserDTO {
  @ApiProperty({
    description: 'Unique identifier for the user',
    required: false,
  })
  _id?: string;

    @ApiProperty({ description: 'User ID', example: '12345', required: false })
  id: string;

  @ApiProperty({ description: 'title', example: 'mr', required: false })
  title: string;
  @ApiProperty({ description: 'One signal Player ID', example: 'player123', required: false })
  playerId?: string;
  @ApiProperty({
    description: 'User type, e.g. user, driver, admin',
    enum: UserType,
    default: UserType.USER,
  })
  userType: UserType; // Add userType field to DTO

  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  username?: string;

  status?: string;

 

  emailStatus?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullname: string;
  @ApiProperty({ description: 'First name of the user', example: 'John ' })
  firstname: string;
  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  lastname: string;
  @ApiProperty({
    description: 'Gender of the user',
    enum: Gender,
    example: 'male',
  })
gender: string;
 
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
  }) // New property
  phone?: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  password?: string;

    @ApiProperty({ description: 'use a user ref code for referral ', example: 'jo9e2' })
  useRefCode?: string;



  @ApiProperty({
    description: 'Profile image URL',
    example: 'http://example.com/image.jpg',
  })
  profileImage?: string;

  @ApiProperty({
    description: 'Indicates if the user is an admin',
    example: false,
  })
  isAdmin?: boolean;

  @ApiProperty({
    description: 'Indicates if the user is a super admin',
    example: false,
  })
  isSuperAdmin?: boolean;

  @ApiProperty({
    description: 'Date of birth of the user',
    example: '1990-01-01T00:00:00.000Z',
    type: Date,
  })
  dob?: Date;
  // Voter Location
  @ApiProperty({ example: 'California' })
  state?: string;

  @ApiProperty({ example: 'USA' })
  country?: string;

  @ApiProperty({ example: 'Los Angeles County', required: false })
  localGovernmentArea?: string;

  @ApiProperty({  example: 'single', enum:['single','married'], required: false })
  maritalStatus?: string;

  @ApiProperty({
    description:
      'Social media profiles with platforms as keys and handles as values',
    example: { twitter: 'user_handle', facebook: 'user_handle' },
    required: false,
  })
  socialMediaProfile?: Record<string, string>;


  @ApiProperty({
    description: 'Residential address of the user',
    example: '123 Main St, Springfield, USA',
    required: false,
  })
  residentialAddress?: string;

  @ApiProperty({
    description: 'Bank account information',
    example: [
      {
        bankName: 'Bank of America',
        accountName: 'John Doe',
        accountNumber: '987654321',
      },
    ],
  })
  bankAccount?: BankAccountDTO[];

  @ApiProperty({
    description: 'User verification details',
    type: VerificationsDTO,
    example: VerificationsDTO,
  })
  verifications?: VerificationsDTO;



  @ApiProperty({ description: 'referral details' })
  referral: Refferal;

  @ApiProperty({ description: 'referral by' })
  refBy: string;
}


