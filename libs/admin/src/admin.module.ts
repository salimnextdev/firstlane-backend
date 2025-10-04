import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { NotificationService, NotificationGateway, SendMailService, FlutterwaveService, TransactionNotificationService, SmsService, AuthNotificationService } from '@app/service';

@Module({
  controllers: [AdminController], 
  providers: [
    AdminService,
    FlutterwaveService,
    NotificationService,
    NotificationGateway,
    SendMailService,
    TransactionNotificationService,
    SmsService,
    AuthNotificationService
  ],
  exports: [AdminService],
})
export class AdminModule {}
