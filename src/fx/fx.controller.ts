import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { FxService } from './fx.service';
import { FxDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("fx")
@ApiBearerAuth("access-token")

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

   @Post()
  @ApiOperation({ summary: "Create a new fx" })
  @ApiBody({
    type: FxDTO,
    description: "Creating a new fx Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() fx: FxDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   fx.organizationID,
    //   req.fx?._id?.toString(),
    //   Action.Create,
    //   FxModel,
    // );
    return this.fxService.upset(fx, req.user);
  }

  @Patch(":fxID")
  @ApiOperation({ summary: "Update existing fxs" })
  @ApiParam({
    name: "fxID",
    description: "The fxID to search for",
    type: String,
  })
  @ApiBody({
    type: FxDTO,
    description: "Updating existing fxs",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() fx: FxDTO, @Param("fxID") fxID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   fx.organizationID,
    //   req.fx._id.toString(),
    //   Action.Update,
    //   FxModel,
    // );
    return this.fxService.update( fxID, fx, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a fx by any key-value pair" })
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
    description: "Number of fxs per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.fxService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all fxs" })
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
    description: "Number of fxs per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.fxService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete fxs by their IDs" })
  @ApiBody({ type: [String], description: "Array of fx IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.fxService.delete(ids, req.user);
  }
  
}
