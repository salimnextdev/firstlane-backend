import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { CollateralDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("collateral")
@ApiBearerAuth("access-token")

@Controller('collateral')
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

   @Post()
  @ApiOperation({ summary: "Create a new collateral" })
  @ApiBody({
    type: CollateralDTO,
    description: "Creating a new collateral Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() collateral: CollateralDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   collateral.organizationID,
    //   req.collateral?._id?.toString(),
    //   Action.Create,
    //   CollateralModel,
    // );
    return this.collateralService.upset(collateral, req.user);
  }

  @Patch(":collateralID")
  @ApiOperation({ summary: "Update existing collaterals" })
  @ApiParam({
    name: "collateralID",
    description: "The collateralID to search for",
    type: String,
  })
  @ApiBody({
    type: CollateralDTO,
    description: "Updating existing collaterals",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() collateral: CollateralDTO, @Param("collateralID") collateralID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   collateral.organizationID,
    //   req.collateral._id.toString(),
    //   Action.Update,
    //   CollateralModel,
    // );
    return this.collateralService.update( collateralID, collateral, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a collateral by any key-value pair" })
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
    description: "Number of collaterals per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.collateralService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all collaterals" })
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
    description: "Number of collaterals per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.collateralService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete collaterals by their IDs" })
  @ApiBody({ type: [String], description: "Array of collateral IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.collateralService.delete(ids, req.user);
  }
  
}
