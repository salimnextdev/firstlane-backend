import { ApiProperty } from "@nestjs/swagger";

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