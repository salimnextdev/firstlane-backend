

import { Body, Controller, Get, Param, Patch, Query, Req, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService, TimeFrame } from './admin.service';
import { JwtAuthGuard } from '@app/guard';
import { LoanStatus } from '@app/enum';
import { SettingsDTO } from '@app/dto';

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
   @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of investments per page",
    type: Number,
  })
  @UseGuards(JwtAuthGuard)
  async getUserInvestments(@Req() req: any,@Query("userID") userID: string,@Query() query: any) {
    return this.adminService.getUserInvestments(userID,query );
  }
  @Get("stats")
  @ApiOperation({ summary: "Get admin dashboard statistics" })
  @UseGuards(JwtAuthGuard)
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get("financial-stats")
  @ApiOperation({ summary: "Get admin financial statistics" })
  @UseGuards(JwtAuthGuard)
  async getAdminFinancialStats() {
    return this.adminService.getAdminFinancialStats();
  }


  @Get("fx-volumes-simple")
  @ApiOperation({ summary: "Get FX volumes by currency (simple)" })
  @ApiQuery({
    name: "userID",
    required: false,
    description: "User ID to filter by",
    type: String,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Comma-separated list of statuses (e.g., completed,pending)",
    type: String,
  })
  @ApiQuery({
    name: "dateFrom",
    required: false,
    description: "Start date for filtering (YYYY-MM-DD)",
    type: String,
  })
  @ApiQuery({
    name: "dateTo",
    required: false,
    description: "End date for filtering (YYYY-MM-DD)",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async getFxVolumesByCurrencySimple(
    @Query('userID') userID?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: {
      userID?: string;
      status?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    } = {};

    if (userID) {
      filters.userID = userID;
    }
    if (status) {
      filters.status = status.split(',');
    }
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return this.adminService.getFxVolumesByCurrencySimple(filters);
  }

  // settings
  @Patch('settings')
  @ApiOperation({ summary: 'Create or update platform settings (Admin)' })
  @ApiBody({ type: SettingsDTO })
  @UseGuards(JwtAuthGuard)
  async createOrUpdateSettings(@Body() body: SettingsDTO) {
    return this.adminService.createSettings(body);
  }
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings (Admin)' })
  @UseGuards(JwtAuthGuard)
  async getSettings() {
    return this.adminService.getSettings();
  }

  // get top n users that refer another user to invest
 @Get('top-referral-staff')
@ApiOperation({ summary: 'Get top referral staff (Admin)' })
@ApiQuery({
  name: 'n',
  required: false,
  description: 'Number of top referral staff to retrieve',
  type: Number,
})
@ApiQuery({
  name: 'timeframe',
  required: false,
  description: 'Timeframe to filter referrals (today, 7days, 30days, 90days, 360days)',
  type: String,
  enum: ['today' , '7d' , '30d' , '90d' , '360d'],
})
@UseGuards(JwtAuthGuard)
async getTopReferralStaff(
  @Query('n') n?: number,
  @Query('timeframe') timeframe?: TimeFrame
) {
  return this.adminService.getTopInvestmentReferrers( timeframe ,n );
}

}
