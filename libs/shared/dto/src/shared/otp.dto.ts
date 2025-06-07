import { Role } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class OTPDTO {
    @ApiProperty({ description: 'Unique identifier for the user', required: false })
  _id?: string;

  @ApiProperty({ description: 'User _id of a user',  })
  userID: string

  @ApiProperty({ description: 'OTP', example: '44035' })
  code: string;

  @ApiProperty({ description: 'Duration of otp in minutes', example: '30' })
  duration: string;

  @ApiProperty({ description: 'status', example: 'active', default:"active" })
  status: string;

  @ApiProperty({ description: 'Type of OTP', example: 'EmailVerification', enum: ['EmailVerification', 'PasswordReset', '2FA'], default: 'verification' })
  type: string;

}