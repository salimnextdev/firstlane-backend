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

import { JwtAuthGuard } from "@app/guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
  PartialType,
} from "@nestjs/swagger";
import { InvestmentDTO, UserInvestmentDTO } from "@app/dto";
import { InvestmentService } from "./investment.service";

class UpdateInvestmentDTO extends PartialType(InvestmentDTO) {
  @ApiProperty({ type: String })
  _id: string;
}

@ApiTags("investments")
@ApiBearerAuth("access-token")
@Controller("investments")
export class InvestmentController {
  constructor(
    private investmentService: InvestmentService
  ) // private organizationAbilityFactory: OrganizationAbilityFactory,

  {}

  @Post()
  @ApiOperation({ summary: "Create a new investment" })
  @ApiBody({
    type: InvestmentDTO,
    description: "Creating a new investment Details",
  })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  async findAll(@Query() query: any) {
    return this.investmentService.findAll(query);
  }

  @Delete("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete investments by their IDs" })
  @ApiBody({ type: [String], description: "Array of investment IDs to delete" })
  async delete(@Body() ids: string[], @Request() req: any) {
    return this.investmentService.delete(ids, req.user);
  }

  //user investment
  @Post("user-investment")
  @ApiOperation({ summary: "Create a new user investment" })
  @ApiBody({
    type: UserInvestmentDTO,
    description: "Creating a new user investment Details",
  })
  @UseGuards(JwtAuthGuard)
  async userInvest(@Body() investment: UserInvestmentDTO, @Request() req: any) {
    return this.investmentService.userInvest(investment, req.user);
  }
}
