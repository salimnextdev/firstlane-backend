import { Role } from '@app/enum';
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

export class LocationDTO {
  @ApiProperty({ description: 'Address' })
  address: string;
  @ApiProperty({ description: 'longitude' })
  long: string;
  @ApiProperty({ description: 'langitude' })
  lag: string;
}

export class VehicleDTO {
  @ApiProperty({ description: 'Vehicle name' })
  name: string;
  @ApiProperty({ description: 'Model name' })
  model: string;
  @ApiProperty({ description: 'Model name' })
  number: string;
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
export class VerificationsDTO {
  @ApiProperty({
    description: 'National Identification Number (NIN)',
    example: '012345678900',
    required: false,
  })
  nin?: string;

  @ApiProperty({
    description: 'URL of the uploaded NIN Slip/Card',
    example: 'https://example.com/nin.jpg',
    required: false,
  })
  ninDocument?: string;

  @ApiProperty({
    description: 'Driver’s License Number',
    example: 'A123456789',
    required: false,
  })
  driverLicense?: string;

  @ApiProperty({
    description: 'URL of the uploaded Driver’s License',
    example: 'https://example.com/license.jpg',
    required: false,
  })
  driverLicenseDocument?: string;

  @ApiProperty({
    description: 'Utility Bill Number',
    example: '987654321',
    required: false,
  })
  utilityBillNumber?: string;

  @ApiProperty({
    description: 'URL of the uploaded Utility Bill',
    example: 'https://example.com/utility.jpg',
    required: false,
  })
  utilityBillDocument?: string;

  @ApiProperty({ description: 'Rejection Reason' })
  rejectionReason?: string;

  @ApiProperty({
    description: 'statusNinDocument',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  statusNinDocument?: 'pending' | 'verified' | 'rejected';

  @ApiProperty({
    description: 'statusUtilityBill',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  statusUtilityBill?: 'pending' | 'verified' | 'rejected';

  @ApiProperty({
    description: 'statusDriverLicense',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  statusDriverLicense?: 'pending' | 'verified' | 'rejected';
}
export class RefreshTokenDTO {
  @ApiProperty({ description: 'refresh_token:' })
  refresh_token: String;
}

export class UpdateVerificationStatusDTO {
  
  @ApiProperty({ description: 'user_id' })
  userID: string;
  @ApiProperty({ description: 'verification type' ,example:'NinDocument' ,enum: ['NinDocument', 'UtilityBill', 'DriverLicense']})
  verificationType: string;
  @ApiProperty({ description: 'status' })
  status: string;
  @ApiProperty({ description: 'rejection reason' })
  rejectionReason?: string;
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

export class PayStackUserDTO {
  @ApiProperty({ description: 'user_id' })
  userID: string;
  @ApiProperty({ description: 'email',example:"janedoe@test.com" })
  email: string;
  @ApiProperty({ description: 'first_name' ,example:"Jane" })
  first_name: string;
  @ApiProperty({ description: 'middle_name',example:"Karen" })
  middle_name: string;
  @ApiProperty({ description: 'last_name',example:"Doe" })
  last_name: string;
  @ApiProperty({ description: 'phone', example: '+2348100000000' })
  phone: string;
  @ApiProperty({ description: 'preferred_bank' ,example: 'test-bank'})
  preferred_bank: string;
  @ApiProperty({ description: 'country', example: 'NG' })
  country: string;


  // @ApiProperty({ description: 'account_number', example: '1234567890' })
  // account_number: string; 
  // @ApiProperty({ description: 'account_name', example: 'Jane Doe' })
  // account_name: string;
  // @ApiProperty({ description: 'bank_name', example: 'Test Bank' })
  // bank_name: string;
  // @ApiProperty({ description: 'bank_code', example: '123' })
  // bank_code: string;
  // @ApiProperty({ description: 'customer_code', example: '123456' })
  // customer_code: string;
  // @ApiProperty({ description: 'amount', example: '10000' })
  // amount: number;

}

export class UserDTO {
  @ApiProperty({
    description: 'Unique identifier for the user',
    required: false,
  })
  _id?: string;

  @ApiProperty({ description: 'User ID', example: '12345', required: false })
  id: string;
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

  territory?: string;

  emailStatus?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullname: string;

  organizationID: string;

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
    description: 'Roles assigned to the user',
    type: [String], // Assuming roles are strings; adjust if using a specific enum type
    example: ['admin', 'user'],
  })
  roles?: String[];

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

  // Voter Location
  @ApiProperty({ example: 'California' })
  state?: string;

  @ApiProperty({ example: 'USA' })
  country?: string;

  @ApiProperty({ example: 'Los Angeles County', required: false })
  localGovernmentArea?: string;

  @ApiProperty({ example: '90001' })
  postalCode?: string;

  @ApiProperty({
    description:
      'Social media profiles with platforms as keys and handles as values',
    example: { twitter: 'user_handle', facebook: 'user_handle' },
    required: false,
  })
  socialMediaProfile?: Record<string, string>;

  @ApiProperty({
    description: 'User location details',
    example: {
      address: '123 Main St, Los Angeles, CA',
      long: '-118.2437',
      lag: '34.0522',
    },
  })
  location?: LocationDTO;

  @ApiProperty({
    description: 'Vehicle information',
    example: {
      name: 'Toyota Camry',
      model: '2019',
      number: 'XYZ-1234',
    },
  })
  vehicle?: VehicleDTO;

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
    example: {
      nin: '012345678900',
      ninDocument: 'https://example.com/nin.jpg',
      driverLicense: 'A123456789',
      driverLicenseDocument: 'https://example.com/license.jpg',
      utilityBillNumber: '987654321',
      utilityBillDocument: 'https://example.com/utility.jpg',
      statusNinDocument: 'pending',
      statusUtilityBill: 'pending',
      statusDriverLicense: 'pending',
      rejectionReason: 'Invalid document',
    },
  })
  verifications?: VerificationsDTO;

  @ApiProperty({ description: 'referral code' })
  refCode: string;

  @ApiProperty({ description: 'referral details' })
  referral: Refferal;

  @ApiProperty({ description: 'referral by' })
  refBy: string;
}
