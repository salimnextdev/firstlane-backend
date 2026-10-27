import { Gender, Role } from '@app/enum';
import { OtpType, UserStatus, UserType } from '@app/enum/shared/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationsDTO } from './kyc.dto';

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
  @ApiProperty({ description: 'Bank code' })
  bankCode: string;
  @ApiProperty({ description: 'Account type' })
  accountType: string;
  @ApiProperty({ description: 'ACH routing number' })
  ACHrouting: string;
  @ApiProperty({ description: 'Wire routing number' })
  wireRouting: string;
  @ApiProperty({ description: 'Swift code' })
  swiftCode: string;
  @ApiProperty({ description: 'Currency' })
  currencyID: string;
  @ApiProperty({ description: 'Currency' })
  currency: string;
@ApiProperty({ description: 'Optional' })
  userID?:string

  
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

export class VerifyAuthenticationDto {
  @ApiProperty({ description: 'user_id',example: '12345' })
  userID: String;
  // @ApiProperty({ description: 'token',  })
  // token: String
  @ApiProperty({ description: 'code', example: '123456' })
  code: String;
  @ApiProperty({ enum:OtpType, example: OtpType.TWO_FACTOR_AUTHENTICATION,  description: 'Type of OTP' })
  type: string;
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

  @ApiProperty({ description: 'status', example: UserStatus.ACTIVE, enum: UserStatus })
  status?: string;

  @ApiProperty({ description: 'user roles', example: ['investment',"loan"] })
  roles: string[];

  @ApiProperty({ description: 'user permissions', example: ['loans', 'investment'] })
  permissions: string[];

  emailStatus?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example2.com',
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


