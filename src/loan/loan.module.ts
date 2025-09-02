import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { NotificationGateway, NotificationService } from '@app/service';

@Module({
  controllers: [LoanController],
  providers: [LoanService,NotificationService,NotificationGateway],
})
export class LoanModule {}
