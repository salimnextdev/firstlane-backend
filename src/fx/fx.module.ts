import { Module } from '@nestjs/common';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';
import { NotificationService, NotificationGateway } from '@app/service';

@Module({
  controllers: [FxController,],
  providers: [FxService,NotificationService,NotificationGateway],
})
export class FxModule {}
