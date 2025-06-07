import { ApiProperty } from "@nestjs/swagger";
export class CountryDTO {
  @ApiProperty({ description: 'Country name', example: 'Nigeria' })
  name: string;

  @ApiProperty({ description: 'Country code', example: 'NG' })
  code?: string;
  @ApiProperty({ description: 'Country currency', example: 'NGN' })
  currency?: string;
  @ApiProperty({ description: 'Country capital', example: 'Abuja' })
  capital?: string;
  @ApiProperty({ description: 'Country flag', example: 'https://flagcdn.com/ng.svg' })
  flag?: string

  @ApiProperty({ description: 'Country dial code', example: '+234' })
  dialCode?: string;
  @ApiProperty({ description: 'Country continent', example: 'Africa' })
  continent?:string

  @ApiProperty({ description: 'Country latitude', example: 9.082 })
  latitude?: number;
  @ApiProperty({ description: 'Country longitude', example: 8.6753 })
  longitude?: number;
  
 
}
