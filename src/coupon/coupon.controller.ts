import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';

import { JwtAuthGuard, PermissionsGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponDTO } from '@app/dto';
import { AdminPermission } from '@app/enum';
import { Permissions } from '@app/decorator';

@ApiTags("coupon")
@ApiBearerAuth("access-token")

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

   @Post()
  @ApiOperation({ summary: "Create a new coupon" })
  @ApiBody({
    type: CouponDTO,
    description: "Creating a new coupon Details",
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async create(@Body() coupon: CouponDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   coupon.organizationID,
    //   req.coupon?._id?.toString(),
    //   Action.Create,
    //   CouponModel,
    // );
    return this.couponService.upset(coupon, req.user);
  }

  @Patch(":couponID")
  @ApiOperation({ summary: "Update existing coupons" })
  @ApiParam({
    name: "couponID",
    description: "The couponID to search for",
    type: String,
  })
  @ApiBody({
    type: CouponDTO,
    description: "Updating existing coupons",
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async update(@Body() coupon: CouponDTO, @Param("couponID") couponID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   coupon.organizationID,
    //   req.coupon._id.toString(),
    //   Action.Update,
    //   CouponModel,
    // );
    return this.couponService.update( couponID, coupon, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a coupon by any key-value pair" })
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
    description: "Number of coupons per page",
    type: Number,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.couponService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all coupons" })
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
    description: "Number of coupons per page",
    type: Number,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async findAll(@Query() query: any) {
    return this.couponService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete coupons by their IDs" })
  @ApiBody({ type: [String], description: "Array of coupon IDs to delete" })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.couponService.delete(ids, req.user);
  }

  @Post('redeem/:code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Redeem a coupon code' })
  @ApiParam({ name: 'code', description: 'Coupon code to redeem', type: String })
  async redeem(@Param('code') code: string, @Req() req: any) {
    return this.couponService.redeem(code, req.user);
  }
  
}
