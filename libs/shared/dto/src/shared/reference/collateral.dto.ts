
import { AppTypeEnum } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class CollateralDTO {
  @ApiProperty({
   example:"name"
  })
  name: string;
  @ApiProperty({ enum: AppTypeEnum,example:AppTypeEnum.LOAN})
  type: string;
   @ApiProperty({
   example:5005
  })
  value: number;

   @ApiProperty({
   example:""
  })
  userID:string
}