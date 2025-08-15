import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { BankAccountDTO, DeleteAccountDTO, ForgotPasswordDTO, LoginDTO, OTPDTO } from '@app/dto';
import { ChangePasswordDTO, RefreshTokenDTO, SetAuthenticatorDto, UserDTO, UserIDDTO, VerifyAuthenticationDto } from '@app/dto';
import { JwtAuthGuard, LocalAuthGuard } from '@app/guard';

  class RegisterDTO extends PickType(
    UserDTO,
    ['title','isAdmin','isSuperAdmin', 'userType','useRefCode','firstname' , 'fullname' , 'lastname' , 'email' , 'password' ,  'gender' , 'phone' , 'residentialAddress']
) {}

@ApiBearerAuth('access-token')
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: RegisterDTO,
    description: 'User details for creating a new user',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  register(@Body() data: RegisterDTO) {
    return this.authService.register(data);
  }

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDTO, description: 'User credentials for login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  signIn(@Body() data: LoginDTO) {
    return this.authService.login(data.email, data.password);
  }


  @Post('send-code-to-email')
  @ApiBody({ type: UserIDDTO , description: 'User ID for sending the code', }) 
  @ApiOperation({ summary: 'Send two-factor authentication code via email' })
  @ApiResponse({ status: 200, description: 'Code sent successfully.' })
  sendTwoFactorAuthenticationMail(@Request() req:Request) {
    return this.authService.sendTwoFactorAuthenticationMail(req.body);
  }

  @Post('send-code-to-sms')
  @ApiBody({ type: OTPDTO , description: 'User ID for sending the code', }) 
  @ApiOperation({ summary: 'Send two-factor authentication code via email' })
  @ApiResponse({ status: 200, description: 'Code sent successfully.' })
  sendTwoFactorAuthenticationSms(@Request() req:Request) {
    return this.authService.sendTwoFactorAuthenticationSms(req.body);
  }

  @Post('verify-authentication')
  @ApiBody({ type: VerifyAuthenticationDto,  description: 'Data for verification' })
  @ApiOperation({ summary: 'Verify two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Authentication successful.' })
  @ApiResponse({ status: 404, description: 'Code not found or expired.' })
  twoFactorAuthenticationLogin(@Request() req:Request) {
    return this.authService.twoFactorAuthenticationLogin(req.body);
  }

  // @Post('set-authenticator')
  // @ApiOperation({ summary: 'Set up two-factor authenticator' })
  // @ApiResponse({ status: 200, description: 'Authenticator set successfully.' })
  // @ApiBody({ type: SetAuthenticatorDto , description: 'User ID and secret for authenticator' })
  // setTwoFactorAuthenticator(@Request() req:Request) {
  //   return this.authService.setTwoFactorAuthenticator(req.body);
  // }


  // @Get('authenticator-secret')
  // @ApiOperation({ summary: 'Get authenticator secret' })
  // @ApiResponse({ status: 200, description: 'Authenticator secret retrieved.' })
  // sendAuthenticatorSecret() {
  //   const secret =  randomUUID().replace(/\d+/g, '').replace(/-/g, '').toUpperCase().substring(0, 10)+randomUUID().replace(/\d+/g, '').replace(/-/g, '').toUpperCase().substring(0, 10);
  //   return {
  //     data:secret
  //   };
  // }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  @ApiBody({ type: RefreshTokenDTO, description: 'Refresh token for generating a new access token' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved.' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBody({ type: UserDTO, description: 'User details for updating the profile' })
  @ApiOperation({ summary: 'edit user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated.' })
  editProfile(@Request() req) {
    return this.authService.editProfile(req.body, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-bank-account')
  @ApiOperation({ summary: 'Add bank account details' })
  @ApiBody({ type: BankAccountDTO, description: 'Bank account details' })
  @ApiResponse({ status: 200, description: 'Bank account added successfully' })
  addBankAccount(@Request() req) {
    return this.authService.addBankAccount(req.user._id, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove-bank-account/:accountNumber')
  @ApiOperation({ summary: 'Remove bank account details' })
 @ApiParam({ name: 'accountNumber', required: true, type: String, description: 'Account number to remove' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 200, description: 'Bank account removed successfully' })
  removeBankAccount(@Request() req,@Param("accountNumber") accountNumber:string) {
    return this.authService.removeBankAccount(req.user._id,accountNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-bank-account')
  @ApiOperation({ summary: 'Get user bank account details' })
  @ApiResponse({ status: 200, description: 'Bank account details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  getUserBankAccount(@Request() req) {
    return this.authService.getUserBanks(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit-bank-account')
  @ApiOperation({ summary: 'Edit user bank account details' })
  @ApiBody({ type: BankAccountDTO, description: 'Bank account details' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  editUserBankAccount(@Request() req) {
    return this.authService.editUserBanks(req.user._id, req.body);
  }
  
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication callback' })
  googleAuthRedirect(@Req() req) {
    return this.authService.ssoGoogle(req)
  }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  @ApiOperation({ summary: 'Login with Facebook' })
  async facebookLogin() {}

  @Get("/facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  @ApiOperation({ summary: 'Facebook authentication callback' })
  async facebookLoginRedirect(@Req() req): Promise<any> {
    return this.authService.ssoFacebook(req)
  }


  // @Get("x")
  // @UseGuards(AuthGuard("x"))
  // @ApiOperation({ summary: 'Login with X' })
  // async xLogin() {}

  // @Get("/x/callback")
  // @UseGuards(AuthGuard("x"))
  // @ApiOperation({ summary: 'X authentication callback' })
  // async xLoginRedirect(@Req() req): Promise<any> {
  //   return {
  //    user: req.user
  //   }
  // }


  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBody({ type: ChangePasswordDTO , })
  @ApiOperation({ summary: 'Change Password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  changePassword(@Request() req) {
    return this.authService.changePassword(req.user._id,req.body.currentPassword,req.body.newPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-account')
  @ApiBody({ type: DeleteAccountDTO , })
  @ApiOperation({ summary: 'User deletes account' })
  @ApiResponse({ status: 200, description: 'Account successfully deleted' })
  deleteAccount(@Request() req) {
    return this.authService.deleteAccount(req.user._id.toString(),req.body.email,req.body.reason)
  }

  // @UseGuards(JwtAuthGuard)
  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDTO , })
  @ApiOperation({ summary: 'forgot Password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  forgotPassword(@Request() req) {
    return this.authService.forgotPassword(req.body.token,req.body.code,req.body.newPassword)
  }

  //verify code
  @Post('verify-code')
  @ApiBody({ schema:{
    type: 'object',
    properties: {
      type: { type: 'string',example:'PasswordReset' },
      code: { type: 'string',example:'123456' },
    },
  } })
  @ApiOperation({ summary: 'verify code' })
  @ApiResponse({ status: 200, description: 'code successfully verified' })
  verifyCode(@Request() req) {
    return this.authService.verifyCode(req.body.type,req.body.code)
  }
  



}

