import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';

import { FxRateDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FxRateService } from './fxrate.service';

@ApiTags("fxRate")
@ApiBearerAuth("access-token")

@Controller('fxRate')
export class FxRateController {
  constructor(private readonly fxRateService: FxRateService) {}

   @Post()
  @ApiOperation({ summary: "Create a new fxRate" })
  @ApiBody({
    type: FxRateDTO,
    description: "Creating a new fxRate Details",
  }) 
  @UseGuards(JwtAuthGuard)
  async create(@Body() fxRate: FxRateDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   fxRate.organizationID,
    //   req.fxRate?._id?.toString(),
    //   Action.Create,
    //   FxRateModel,
    // );
    return this.fxRateService.upset(fxRate, req.user);
  }

  @Patch(":fxRateID")
  @ApiOperation({ summary: "Update existing fxRates" })
  @ApiParam({
    name: "fxRateID",
    description: "The fxRateID to search for",
    type: String,
  })
  @ApiBody({
    type: FxRateDTO,
    description: "Updating existing fxRates",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() fxRate: FxRateDTO, @Param("fxRateID") fxRateID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   fxRate.organizationID,
    //   req.fxRate._id.toString(),
    //   Action.Update,
    //   FxRateModel,
    // );
    return this.fxRateService.update( fxRateID, fxRate, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a fxRate by any key-value pair" })
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
    description: "Number of fxRates per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.fxRateService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all fxRates" })
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
    description: "Number of fxRates per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.fxRateService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete fxRates by their IDs" })
  @ApiBody({ type: [String], description: "Array of fxRate IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.fxRateService.delete(ids, req.user);
  }
  
}
