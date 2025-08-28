import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { NotificationService, NotificationGateway, SendMailService, FlutterwaveService } from '@app/service';

@Module({
  controllers: [AdminController], 
  providers: [AdminService,FlutterwaveService,NotificationService,NotificationGateway,SendMailService],
  exports: [AdminService],
})
export class AdminModule {}
