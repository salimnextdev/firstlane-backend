

import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@app/guard';

@Controller('admin')
@ApiTags("admin")
@ApiBearerAuth("access-token")
export class AdminController {
constructor(private readonly adminService: AdminService) {}


//   Update KYC status (for admin use)
  @Patch('kyc-status/:userId')
  @ApiOperation({ summary: 'Update KYC status (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'verified', enum: ['verified', 'rejected'] },
        notes: { type: 'string', example:"Image not clear" },
      },
     
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateKycStatus(
    @Param('userId') userId: string,
    @Body() body: { status: 'verified' | 'rejected'; notes?: string },
    @Req() req: any,
  ) {
    return this.adminService.updateKycStatus(
      userId,
      body.status,
      req.user,
      body.notes,
    );
  }

//   get all users with KYC for kyc
  @Get('kyc-users')
  @ApiOperation({ summary: 'Get all users with KYC information (Admin)' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users per page',
    type: Number,
  })
  
  @UseGuards(JwtAuthGuard)
  async getAllKycUsers( @Query() query: any) {
    return this.adminService.getAllKycUsers(query);
  }
  

}
