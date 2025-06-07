import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { NotificationGateway, NotificationService, SendMailService } from '@app/service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService,NotificationService,NotificationGateway,SendMailService],
  exports: [UserService],
  controllers:[UserController]
})
export class UserModule {}
