import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { NotificationGateway, NotificationService } from '@app/service';

@Module({
  controllers: [SupportController],
  providers: [SupportService,NotificationService,NotificationGateway],
})
export class SupportModule {}
