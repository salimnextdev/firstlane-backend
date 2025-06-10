import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Req,
  UseGuards,
} from "@nestjs/common";
import { KycService } from "./kyc.service";
import { UserDTO, VerificationsDTO } from "@app/dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags, PickType } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/guard";

  class KYCSubmitDTO extends PickType(
    UserDTO,
    ['profileImage','dob','maritalStatus','state','country','gender','residentialAddress','localGovernmentArea']
) {}

  // class KYCStatusDTO extends PickType(
  //   VerificationsDTO,
  //   ['kycStatus','kycMessage']
  // ) 
  // {} 
   class KYCLevel2DTO extends PickType(
    VerificationsDTO,
    ['idNumber','idType','issueDate','expiryDate','bvn']
  ) {}

  class KYCLevel3DTO extends PickType(
    VerificationsDTO,
    ['nextOfKin']
  ) {}

  class KYCLevel4DTO extends PickType(
    VerificationsDTO,
    ['bankStatements']
  ) {}


@Controller("kyc")
@ApiTags("kyc")
@ApiBearerAuth("access-token")
export class KycController {
  constructor(private readonly kycService: KycService) {}
  private readonly logger = new Logger(KycController.name);
  @Post("kyc-level-1")
  @ApiOperation({ summary: "Submit KYC information" })
  @ApiBody({ type: KYCSubmitDTO, description: "KYC information" })
  @UseGuards(JwtAuthGuard)
  async submitKyc(@Body() kycData: KYCSubmitDTO,  @Req() req: any) {
    return this.kycService.submitKyc(req.user._id.toString(), kycData);
  }
  @Post("kyc-level-2")
  @ApiOperation({ summary: "Submit KYC Level 2 information" })
  @ApiBody({ type: KYCLevel2DTO, description: "KYC Level 2 information" })
  @UseGuards(JwtAuthGuard)
  async submitKycLevel2(@Body() kycData: KYCLevel2DTO,  @Req() req: any) {
    return this.kycService.submitKycLevel2(req.user._id.toString(), kycData);
  }

  @Post("kyc-level-3")
  @ApiOperation({ summary: "Submit KYC Level 3 information" })
  @ApiBody({ type: KYCLevel3DTO, description: "KYC Level 3 information" })
  @UseGuards(JwtAuthGuard)
  async submitKycLevel3(@Body() kycData: KYCLevel3DTO,  @Req() req: any) {
    return this.kycService.submitKycLevel3(req.user._id.toString(), kycData.nextOfKin);
  }

  @Post("kyc-level-4")
  @ApiOperation({ summary: "Submit KYC Level 4 information" })
  @ApiBody({ type: KYCLevel4DTO, description: "KYC Level 4 information" })
  @UseGuards(JwtAuthGuard)
  async submitKycLevel4(@Body() kycData: KYCLevel4DTO,  @Req() req: any) {
    return this.kycService.submitKycLevel4(req.user._id.toString(), kycData.bankStatements);
  }
  


  @Get("status/:userId")
  @UseGuards(JwtAuthGuard)
  async getKycStatus(@Param("userId") userId: string) {
    return this.kycService.getKycStatus(userId);
  }


}
