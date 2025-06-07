
import { ApiProperty } from '@nestjs/swagger';
export class DisputeTypeDTO {

  @ApiProperty({ description: 'Unique identifier for the dispute type', required: false })
  _id?: string;

  @ApiProperty({ description: 'Name of the dispute type' })
  name: string;

  @ApiProperty({ description: 'Description of the dispute type' })
  description: string;

  @ApiProperty({ description: 'Status of the dispute type', enum: ['active', 'inactive'], default: 'active' })
  status: string;


}