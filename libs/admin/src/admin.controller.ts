

import { Body, Controller, Get, Param, Patch, Query, Req, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService, TimeFrame } from './admin.service';
import { JwtAuthGuard, PermissionsGuard } from '@app/guard';
import { AdminPermission, LoanStatus } from '@app/enum';
import { Permissions } from '@app/decorator';
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.USERS)
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
  
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.USERS)
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.LOANS)
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.INVESTMENT)
  async getUserInvestments(@Req() req: any,@Query("userID") userID: string,@Query() query: any) {
    return this.adminService.getUserInvestments(userID,query );
  }
  @Get("stats")
  @ApiOperation({ summary: "Get admin dashboard statistics" })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get("financial-stats")
  @ApiOperation({ summary: "Get admin financial statistics" })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.WALLET)
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.FX_TRANSACTION)
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async createOrUpdateSettings(@Body() body: SettingsDTO) {
    return this.adminService.createSettings(body);
  }
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings (Admin)' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
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
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(AdminPermission.ADMIN)
async getTopReferralStaff(
  @Query('n') n?: number,
  @Query('timeframe') timeframe?: TimeFrame
) {
  return this.adminService.getTopInvestmentReferrers( timeframe ,n );
}

//getInvestmentsSortedByDueDate
  @Get("upcoming")
  @ApiOperation({ summary: "Get all upcoming user investments" })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.LOANS, AdminPermission.INVESTMENT)
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
  async findAll(@Query() query: any) {
    return this.adminService.getInvestmentsSortedByDueDate(query);
  }

  @Get("upcoming-payouts")
  @ApiOperation({ summary: "Get all upcoming payouts (Loans, Investment, FX)" })
  @ApiQuery({ name: 'type', required: false, enum: ['loan', 'investment', 'fx'], description: 'Filter by payout type' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.LOANS, AdminPermission.INVESTMENT, AdminPermission.FX_TRANSACTION)
  async getUpcomingPayouts(@Query() query: any) {
    return this.adminService.getUpcomingPayouts(query);
  }

  @Patch('assign-permissions/:userId')
  @ApiOperation({ summary: 'Assign permissions to an admin (Super Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['loans', 'investment', 'fx transaction', 'wallet', 'users', 'Admin', 'support']
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async assignPermissions(
    @Param('userId') userId: string,
    @Body() body: { permissions: string[] },
    @Req() req: any,
  ) {
    return this.adminService.assignAdminPermissions(
      userId,
      body.permissions,
      req.user,
    );
  }

  @Get('admins')
  @ApiOperation({ summary: 'Get all admins (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(AdminPermission.ADMIN)
  async getAllAdmins(@Query() query: any) {
    return this.adminService.getAllAdmins(query);
  }

}
