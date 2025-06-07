
import { ApiProperty } from '@nestjs/swagger';

export class AdDTO {
  @ApiProperty({ description: 'Unique identifier for the ad', required: false })
  _id?: string;

  @ApiProperty({ description: 'Title of the ad' })
  title: string;

  @ApiProperty({ description: 'Description of the ad' })
  description: string;

  @ApiProperty({ description: 'URL of the ad image' })
  imageUrl: string;

  @ApiProperty({ description: 'URL the ad links to' })
  linkUrl: string;

  @ApiProperty({ description: 'Start date of the ad campaign' })
  startDate: Date;
  @ApiProperty({ description: 'location of the ad' })
  location: string;
  
  @ApiProperty({ description: 'End date of the ad campaign' })
  endDate: Date;

  @ApiProperty({ description: 'Status of the ad', enum: ['active', 'inactive'], default: 'active' })
  status: string;
}


