
import { AppTypeEnum } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class CouponDTO {
  @ApiProperty({
    example: ["687f966ff5a15e9164b36cf7"],
  })
  userIDs: string[];
  @ApiProperty({ example: "code" })
  code: string;
  @ApiProperty({ enum: AppTypeEnum, example: AppTypeEnum.INVESTMENT })
  type: string;
  @ApiProperty({ example: 1 })
  max: string;
}