import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard, PermissionsGuard } from "@app/guard";
import { AdminPermission } from "@app/enum";
import { Permissions } from "@app/decorator";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import { InvestmentDTO, UserInvestmentDTO } from "@app/dto";
import { InvestmentService } from "./investment.service";
import { InvestmentCronService } from "./investment.cron.service";

class UpdateInvestmentDTO extends PartialType(InvestmentDTO) {
  @ApiProperty({ type: String })
  _id: string;
}
export class UserInvestmentToPlan extends PickType(
  UserInvestmentDTO,
  ['amount','investmentID','repaymentInterval','duration','interestRate']
) {}
@ApiTags("investments")
@ApiBearerAuth("access-token")
@Controller("investments")
export class InvestmentController {
  constructor(
    private investmentService: InvestmentService,
     private investmentCronService: InvestmentCronService,
  ) // private organizationAbilityFactory: OrganizationAbilityFactory,

  {}

  @Post()
  @ApiOperation({ summary: "Create a new investment" })
  @ApiBody({
    type: InvestmentDTO,
    description: "Creating a new investment Details",
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  async create(@Body() investment: InvestmentDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   investment.organizationID,
    //   req.investment?._id?.toString(),
    //   Action.Create,
    //   InvestmentModel,
    // );
    return this.investmentService.upset(investment, req.user);
  }

  @Patch()
  @ApiOperation({ summary: "Update existing investments" })
  @ApiBody({
    type: UpdateInvestmentDTO,
    description: "Updating existing investments",
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  async update(@Body() investment: InvestmentDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   investment.organizationID,
    //   req.investment._id.toString(),
    //   Action.Update,
    //   InvestmentModel,
    // );
    return this.investmentService.update(investment, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a investment by any key-value pair" })
  @ApiParam({ name: "key", description: "The key to search by", type: String })
  @ApiParam({
    name: "value",
    description: "The value to search for",
    type: String,
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of investments per page",
    type: Number,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.investmentService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all investments" })
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of investments per page",
    type: Number,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  async findAll(@Query() query: any) {
    return this.investmentService.findAll(query);
  }

  @Delete("transfer-delete/:investmentID")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  @ApiParam({
    name: "investmentID",
    description: "The investmentID to search for",
    type: String,
  })
  @ApiOperation({ summary: "Delete investments by their IDs" })
  @ApiBody({ type: [String], description: "Array of investment IDs to delete" })
  async delete(@Body() ids: string[], @Param("investmentID") investmentID: string, @Request() req: any) {
    return this.investmentService.delete(ids,investmentID, req.user);
  }

  //user investment
  @Post("user-investment")
  @ApiOperation({ summary: "Create a new user investment" })
  @ApiBody({
    type: UserInvestmentToPlan,
    description: "Creating a new user investment Details",
  })
  @UseGuards(JwtAuthGuard)
  async userInvest(@Body() investment: UserInvestmentToPlan, @Request() req: any) {
    return this.investmentService.userInvest(investment, req.user);
  }
  //get user investments
  @Get("user-investment")
  @ApiOperation({ summary: "Get all user investments" })
  @ApiQuery({
    name: "userID",
    required: false,
    description: "userID",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async getUserInvestments(@Request() req: any,@Query("userID") userID: string) {
    return this.investmentService.getUserInvestments(userID || req.user._id.toString());
  }

  @Get("user-investment/:code")
  @ApiOperation({ summary: "Get user investment by code" })
  @ApiParam({
    name: "code",
    required: true,
    description: "Investment code",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async getbyInvestmentCode(@Param("code") code: string) {
    return this.investmentService.getbyInvestmentCode(code);
  }

  @Post("user-investment/copy/:code")
  @ApiOperation({ summary: "Copy user investment by code" })
  @ApiParam({
    name: "code",
    required: true,
    description: "Investment code",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async copyInvestment(@Param("code") code: string, @Request() req: any) {
    return this.investmentService.copyInvestment(code, req.user);
  }
@Patch(':id/refresh-status')
  @ApiOperation({ summary: "Refresh investment status" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Investment ID",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async refreshInvestmentStatus(@Param('id') id: string) {
    const updatedInvestment = await this.investmentCronService.refreshStatus(id);
  
    return updatedInvestment;
  }
  
}
