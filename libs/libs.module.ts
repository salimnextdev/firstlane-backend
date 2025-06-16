import { AuthModule } from '@app/auth';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadsModule } from './uploads/src';
import { UserModule } from '@app/user';
import { AdminModule } from '@app/admin';
import { KycModule } from '@app/kyc';
import { InvestmentPlanModule, } from '@app/investment-plan';
import { InvestmentModule } from '@app/investment';

@Module({
  imports: [
    AuthModule,
    UserModule,
    UploadsModule,
    AdminModule,
    KycModule,
       InvestmentModule,
    InvestmentPlanModule
    
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class LibsModule {}
