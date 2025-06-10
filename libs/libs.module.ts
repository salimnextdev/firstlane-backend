import { AuthModule } from '@app/auth';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadsModule } from './uploads/src';
import { UserModule } from '@app/user';
import { AdminModule } from '@app/admin';
import { KycModule } from '@app/kyc';


@Module({
  imports: [
    AuthModule,
    UserModule,
    UploadsModule,
    AdminModule,
    KycModule,
    
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class LibsModule {}
