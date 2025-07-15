import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { DurationService } from './duration.service';
import { DurationDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("duration")
@ApiBearerAuth("access-token")

@Controller('duration')
export class DurationController {
  constructor(private readonly durationService: DurationService) {}

   @Post()
  @ApiOperation({ summary: "Create a new duration" })
  @ApiBody({
    type: DurationDTO,
    description: "Creating a new duration Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() duration: DurationDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   duration.organizationID,
    //   req.duration?._id?.toString(),
    //   Action.Create,
    //   DurationModel,
    // );
    return this.durationService.upset(duration, req.user);
  }

  @Patch(":durationID")
  @ApiOperation({ summary: "Update existing durations" })
  @ApiParam({
    name: "durationID",
    description: "The durationID to search for",
    type: String,
  })
  @ApiBody({
    type: DurationDTO,
    description: "Updating existing durations",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() duration: DurationDTO, @Param("durationID") durationID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   duration.organizationID,
    //   req.duration._id.toString(),
    //   Action.Update,
    //   DurationModel,
    // );
    return this.durationService.update( durationID, duration, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a duration by any key-value pair" })
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
    description: "Number of durations per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.durationService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all durations" })
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
    description: "Number of durations per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.durationService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete durations by their IDs" })
  @ApiBody({ type: [String], description: "Array of duration IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.durationService.delete(ids, req.user);
  }
  
}
