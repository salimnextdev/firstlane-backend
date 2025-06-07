
import { ApiProperty } from "@nestjs/swagger";
export class StateDTO {
    
  @ApiProperty({ description: 'State id', example: '1' })
    id: string;
  @ApiProperty({ description: 'State name', example: 'California' })
  name: string;

  @ApiProperty({ description: 'State code', example: 'CA' })
  code?: string;
  @ApiProperty({ description: 'State country', example: 'US' })
  country?: string;

  @ApiProperty({ description: 'State country', example: 'US' })
  countryId?: string;
  @ApiProperty({ description: 'State capital', example: 'Sacramento' })
  capital?: string;
  @ApiProperty({ description: 'State flag', example: 'https://flagcdn.com/us-ca.svg' })
  flag?: string
 
  @ApiProperty({ description: 'state latitude', example: 9.082 })
  latitude?: number;
  @ApiProperty({ description: 'state longitude', example: 8.6753 })
  longitude?: number; 
}
