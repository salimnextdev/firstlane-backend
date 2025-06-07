import { AuthModule } from '@app/auth';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadsModule } from './uploads/src';
import { UserModule } from '@app/user';


@Module({
  imports: [
    AuthModule,
    UserModule,
    UploadsModule
    
    
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class LibsModule {}
