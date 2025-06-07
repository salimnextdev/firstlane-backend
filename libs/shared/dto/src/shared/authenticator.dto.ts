import { Role } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class AuthenticatorDTO {
    @ApiProperty({ description: 'Unique identifier for the user', required: false })
  _id?: string;

  @ApiProperty({ description: 'User _id of a user',  })
  userID: string

  @ApiProperty({ description: 'Authenticator secret', example: 'SJKBSOJPOSBH' })
  secret: string;

  @ApiProperty({ description: 'status', example: 'active', default:"active" })
  status: string;
}