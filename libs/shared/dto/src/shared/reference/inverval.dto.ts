
import { AppTypeEnum } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class IntervalDTO {
  @ApiProperty({
   example:"name"
  })
  name: string;
  @ApiProperty({ enum: AppTypeEnum,example:AppTypeEnum.LOAN})
  type: string;
}