import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@app/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Action } from '@app/enum';
import { UserModel } from '@app/schema';


import { UpdateVerificationStatusDTO, UserDTO } from '@app/dto';
import { UserService } from './user.service';
import { NotificationService } from '@app/service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
     
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: UserDTO,
    description: 'Creating a new user Details',
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() user: UserDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   user.organizationID,
    //   req.user?._id?.toString(),
    //   Action.Create,
    //   UserModel,
    // );
    return this.userService.upset(user, req.user);
  }

  @Post('onesignal')
  @ApiOperation({ summary: 'Save player ID' })
  @ApiBody({
    description: 'Saving player ID',
    schema: {
      type: 'object',
      properties: {
        playerId: { type: 'string', example: 'abcdef123456' },
        userID: { type: 'string', example: 'user_001' },
      },
      required: ['playerId', 'userID'],
    },
  })
  @UseGuards(JwtAuthGuard)

  async savePlayerId(@Body() body: { playerId: string, userID: string }) {
    return this.userService.savePlayerId(body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update existing users' })
  @ApiBody({
    type: UserDTO,
    description: 'Updating existing users',
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() user: UserDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   user.organizationID,
    //   req.user._id.toString(),
    //   Action.Update,
    //   UserModel,
    // );
    return this.userService.update(user, req.user);
  }

  @Get('by-any/:key/:value')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find a user by any key-value pair' })
  @ApiParam({ name: 'key', description: 'The key to search by', type: String })
  @ApiParam({
    name: 'value',
    description: 'The value to search for',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users to return',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of users to skip for pagination',
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any,

  ) {
    return this.userService.findbyAny(params, query);
  }

  @Get('')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users to return',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of users to skip for pagination',
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  @Delete('')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete users by their IDs' })
  @ApiBody({ type: [String], description: 'Array of user IDs to delete' })
  async delete(@Body() ids: string[], @Request() req: any) {
    return this.userService.delete(ids, req.user);
  }

  @Delete('email')
  @ApiOperation({ summary: 'Delete users by their Emails' })
  @ApiBody({ type: [String], description: 'Array of user IDs to delete' })
  async deleteByEmails(@Body() ids: string[],@Req() req) {
    return this.userService.deleteByEmails(ids);
  }


  @Get('period')
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users to return',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of users to skip for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'period',
    required: true,
    description: `'day' | 'week' | 'month'`,
    type: String,
  })
  @ApiOperation({ summary: '' })
  async findRecentUsers(@Query('period') period:'day' | 'week' | 'month',@Query() query) {
    return this.userService.findRecentUsers(period,query);
  }

  @Get('count')
  async countRecentUsers() {
    return this.userService.countRecentUsers();
  }


  @Patch(':userId/status')
  @ApiBody({
    type: UpdateVerificationStatusDTO,
    description: 'Updating existing users',
  })
    @ApiOperation({ summary: 'Admin Update user verification status' })
    @ApiResponse({ status: 200, description: 'User verification status updated' })
    async updateVerificationStatus(
        @Param('userId') userId: string,
        @Body() status: UpdateVerificationStatusDTO,
        
    ) {
        return this.userService.updateVerificationStatus(status);
    }

    @Get('notification/by-any/:key/:value')
    @ApiOperation({ summary: 'Find a user notification by any key-value pair' })
    @ApiParam({ name: 'key', description: 'The key to search by', type: String })
    @ApiParam({
      name: 'value',
      description: 'The value to search for',
      type: String,
    })
    @ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of users to return',
      type: Number,
    })
    @ApiQuery({
      name: 'skip',
      required: false,
      description: 'Number of users to skip for pagination',
      type: Number,
    })
    async getNotification(
      @Param() params: { key: string; value: string },
      @Query() query: any,
  
    ) {
      return this.userService.getNotification(params, query);
    }

    @Get('user-ref-list/:id')
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: '_id', description: 'The _id of the user', type: String })
    @ApiOperation({ summary: 'Get all user ref list' })
    async getAllUserRefList(@Param('id') id:string) {
      return this.userService.getAllUserRefList(id);
    }
    
    //rating 
    @Get('rating/:id')
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: '_id', description: 'The _id of the user', type: String })
    @ApiOperation({ summary: 'Get user rating' })
    async getUserRating(@Param('id') id:string) {
      return this.userService.getUserRating(id);
    }
    
    
    //get rating
    @Get('rating')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all user rating' })
    @ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of users to return',
      type: Number,
    })
    @ApiQuery({      name: 'state',
      required: true,
      description: 'state of the rider',
      type: String,
    })
  
    
    async getAllUserRating(@Query() query: any) {
      return this.userService.getRidersByRating(query);
    }

    //markAllUserNotificationAsRead
    @Patch('notification/mark-all-as-read')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mark all user notifications as read' })
    async markAllUserNotificationAsRead(@Req() req: any) {
      return this.userService.markAllUserNotificationAsRead(req.user._id);
    }

    @Get('notification/unread-count')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get unread notification count for user' })
    async getUnreadNotificationCount(@Req() req: any) {
      return this.userService.getUnreadNotificationCount(req.user._id);
    }
    
}
