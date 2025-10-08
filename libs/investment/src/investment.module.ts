import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { FlutterwaveService, NotificationGateway, TransactionNotificationService } from '@app/service';
import { NotificationService } from '@app/service';
import { InvestmentCronService } from './investment.cron.service';

@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService, FlutterwaveService,NotificationGateway, NotificationService,InvestmentCronService,TransactionNotificationService],
  exports: [InvestmentService,InvestmentCronService],
})
export class InvestmentModule {}
