import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';


import {
  FacebookStrategy,
  JwtStrategy,
  
  XStrategy,
  GoogleStrategy,
  
} from '@app/strategy';

import { LocalStrategy } from './local.strategy';

// import { UsersModule, UsersService } from '../users/src';
// import { OrganizationAbilityFactory } from '../users/src/organization-ability.factory';
import { NotificationService, NotificationGateway, SendMailService, PaystackService, TransactionNotificationService, AuthNotificationService } from '@app/service';

import { SmsService } from '@app/service/shared/sms.service';
import { FlutterwaveService } from '@app/service/shared/payment/flutterwave';
import { UserModule, UserService } from '@app/user';


@Module({
  imports: [PassportModule, UserModule],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    XStrategy,
    UserService,
    SendMailService,
    SmsService,
    TransactionNotificationService,
    AuthNotificationService,
    LocalStrategy,PaystackService,
    NotificationService,NotificationGateway,FlutterwaveService
  ],
  controllers: [AuthController],
  exports:[AuthService]
})
export class AuthModule {}
