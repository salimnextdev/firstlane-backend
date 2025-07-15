import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { PurposeService } from './purpose.service';
import { PurposeDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("purpose")
@ApiBearerAuth("access-token")

@Controller('purpose')
export class PurposeController {
  constructor(private readonly purposeService: PurposeService) {}

   @Post()
  @ApiOperation({ summary: "Create a new purpose" })
  @ApiBody({
    type: PurposeDTO,
    description: "Creating a new purpose Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() purpose: PurposeDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   purpose.organizationID,
    //   req.purpose?._id?.toString(),
    //   Action.Create,
    //   PurposeModel,
    // );
    return this.purposeService.upset(purpose, req.user);
  }

  @Patch(":purposeID")
  @ApiOperation({ summary: "Update existing purposes" })
  @ApiParam({
    name: "purposeID",
    description: "The purposeID to search for",
    type: String,
  })
  @ApiBody({
    type: PurposeDTO,
    description: "Updating existing purposes",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() purpose: PurposeDTO, @Param("purposeID") purposeID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   purpose.organizationID,
    //   req.purpose._id.toString(),
    //   Action.Update,
    //   PurposeModel,
    // );
    return this.purposeService.update( purposeID, purpose, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a purpose by any key-value pair" })
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
    description: "Number of purposes per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.purposeService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all purposes" })
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
    description: "Number of purposes per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.purposeService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete purposes by their IDs" })
  @ApiBody({ type: [String], description: "Array of purpose IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.purposeService.delete(ids, req.user);
  }
  
}
