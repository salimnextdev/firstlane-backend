import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { IntervalService } from './interval.service';
import { IntervalDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("interval")
@ApiBearerAuth("access-token")

@Controller('interval')
export class IntervalController {
  constructor(private readonly intervalService: IntervalService) {}

   @Post()
  @ApiOperation({ summary: "Create a new interval" })
  @ApiBody({
    type: IntervalDTO,
    description: "Creating a new interval Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() interval: IntervalDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   interval.organizationID,
    //   req.interval?._id?.toString(),
    //   Action.Create,
    //   IntervalModel,
    // );
    return this.intervalService.upset(interval, req.user);
  }

  @Patch(":intervalID")
  @ApiOperation({ summary: "Update existing intervals" })
  @ApiParam({
    name: "intervalID",
    description: "The intervalID to search for",
    type: String,
  })
  @ApiBody({
    type: IntervalDTO,
    description: "Updating existing intervals",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() interval: IntervalDTO, @Param("intervalID") intervalID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   interval.organizationID,
    //   req.interval._id.toString(),
    //   Action.Update,
    //   IntervalModel,
    // );
    return this.intervalService.update( intervalID, interval, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a interval by any key-value pair" })
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
    description: "Number of intervals per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.intervalService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all intervals" })
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
    description: "Number of intervals per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.intervalService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete intervals by their IDs" })
  @ApiBody({ type: [String], description: "Array of interval IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.intervalService.delete(ids, req.user);
  }
  
}
