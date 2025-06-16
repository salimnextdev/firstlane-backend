import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { FlutterwaveService, NotificationGateway } from '@app/service';
import { NotificationService } from '@app/service';

@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService, FlutterwaveService,NotificationGateway, NotificationService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
