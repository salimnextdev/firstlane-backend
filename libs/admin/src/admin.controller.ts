

import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@app/guard';
import { LoanStatus } from '@app/enum';

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
  
  //change loan status
  @Patch('loan-status/:loanId')
  @ApiOperation({ summary: 'Update loan status (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'approved', enum: Object.values(LoanStatus) },
        notes: { type: 'string', example:"Image not clear" },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateLoanStatus(
    @Param('loanId') loanId: string,
    @Body() body: { status: LoanStatus; notes?: string },
    @Req() req: any,
  ) {
    return this.adminService.changeLoanStatus(
      loanId,
      body.status,
      req.user,
      body.notes,
    );
  }

//get user investments
  @Get("user-investment")
  @ApiOperation({ summary: "Get all users investments" })
  @ApiQuery({
    name: "userID",
    required: false,
    description: "userID optional",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async getUserInvestments(@Req() req: any,@Query("userID") userID: string) {
    return this.adminService.getUserInvestments(userID );
  }
}
