import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("currency")
@ApiBearerAuth("access-token")

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

   @Post()
  @ApiOperation({ summary: "Create a new currency" })
  @ApiBody({
    type: CurrencyDTO,
    description: "Creating a new currency Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() currency: CurrencyDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   currency.organizationID,
    //   req.currency?._id?.toString(),
    //   Action.Create,
    //   CurrencyModel,
    // );
    return this.currencyService.upset(currency, req.user);
  }

  @Patch(":currencyID")
  @ApiOperation({ summary: "Update existing currencys" })
  @ApiParam({
    name: "currencyID",
    description: "The currencyID to search for",
    type: String,
  })
  @ApiBody({
    type: CurrencyDTO,
    description: "Updating existing currencys",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() currency: CurrencyDTO, @Param("currencyID") currencyID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   currency.organizationID,
    //   req.currency._id.toString(),
    //   Action.Update,
    //   CurrencyModel,
    // );
    return this.currencyService.update( currencyID, currency, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a currency by any key-value pair" })
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
    description: "Number of currencys per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.currencyService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all currencys" })
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
    description: "Number of currencys per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.currencyService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete currencys by their IDs" })
  @ApiBody({ type: [String], description: "Array of currency IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.currencyService.delete(ids, req.user);
  }
  
}
