import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { NotificationService, NotificationGateway, SendMailService } from '@app/service';

@Module({
  controllers: [KycController],
  providers: [KycService,NotificationService,NotificationGateway,SendMailService],
  exports: [KycService],
})
export class KycModule {}
