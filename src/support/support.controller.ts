import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';

import { SupportDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service';

@ApiTags("support")
@ApiBearerAuth("access-token")

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

   @Post()
  @ApiOperation({ summary: "Create a new support" })
  @ApiBody({
    type: SupportDTO,
    description: "Creating a new support Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() support: SupportDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   support.organizationID,
    //   req.support?._id?.toString(),
    //   Action.Create,
    //   SupportModel,
    // );
    return this.supportService.upset(support, req.user);
  }

  @Patch(":supportID")
  @ApiOperation({ summary: "Update existing supports" })
  @ApiParam({
    name: "supportID",
    description: "The supportID to search for",
    type: String,
  })
  @ApiBody({
    type: SupportDTO,
    description: "Updating existing supports",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() support: SupportDTO, @Param("supportID") supportID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   support.organizationID,
    //   req.support._id.toString(),
    //   Action.Update,
    //   SupportModel,
    // );
    return this.supportService.update( supportID, support, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a support by any key-value pair" })
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
    description: "Number of supports per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.supportService.findByAny(params, query);
  }
@Get("user-admin-support-list")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user or admin support list where supportID is null" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of supports per page",
    type: Number,
  })
  async findUserOrAdminSupportList(@Query() query: any, @Req() req: any) {
    return this.supportService.findUserOrAdminSupportList(query, req.user);
  }

  @Get("user-admin-support-messages")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user or admin support messages by supportID" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of supports per page",
    type: Number,
  })
  @ApiQuery({
    name: "supportID",
    required: true,
    description: "ID of the support ticket",
    type: String,
  })
  async findUserOrAdminSupportMessages(@Query() query: any, @Req() req: any) {
    return this.supportService.findUserOrAdminSupportMessages(query, req.user);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all supports" })
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
   @ApiQuery({
    name: "supportID",
     required: false,
    description: "ID of the support ticket",
    type: String,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of supports per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.supportService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete supports by their IDs" })
  @ApiBody({ type: [String], description: "Array of support IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.supportService.delete(ids, req.user);
  }
  
}
