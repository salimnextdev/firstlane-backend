import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanCronService } from './loan.cron.service';
import { 
  NotificationGateway, 
  NotificationService, 
  FlutterwaveService,
  TransactionNotificationService, 
  SendMailService,
  SmsService
} from '@app/service';

@Module({
  controllers: [LoanController],
  providers: [
    LoanService,
    LoanCronService,
    NotificationService,
    NotificationGateway,
    FlutterwaveService,
    SendMailService,
    SmsService,
    TransactionNotificationService
  ],
})
export class LoanModule {}
