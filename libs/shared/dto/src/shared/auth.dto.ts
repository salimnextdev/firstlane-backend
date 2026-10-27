import { Role } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDTO {
  // @ApiProperty({ description: 'email || username', example: 'john@example2.com' })
  // email: string

  @ApiProperty({ description: 'Password', example: 'password123' })
  password: string;
  @ApiProperty({ description: 'email ', example: 'john@example2.com' })
  email: string;
}