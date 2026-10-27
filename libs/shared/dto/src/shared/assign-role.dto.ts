import { ApiProperty } from "@nestjs/swagger";

export class AssignRoleDTO {
  @ApiProperty({ description: 'Unique identifier for the role', required: false })
  _id?: string;

  @ApiProperty({ description: 'Role name', example: 'Super Admin' })
  roleName: string;

  @ApiProperty({ description: 'User ID', example: '12345' })
  userID: string;
  
 
  @ApiProperty({ description: 'permissions',example:["UserModelCreate","UserModelUpadate","UserModelDelete","UserModelRead"]  })
  permissions: string[];
  
  @ApiProperty({ example: 'California' })
  state?: string;
  
  @ApiProperty({ description: 'Role description', })
  description :string
}