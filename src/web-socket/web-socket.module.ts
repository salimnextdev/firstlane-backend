import { NotificationGateway } from '@app/service';
import { RideSocketGateway } from '@app/service';
import { Module } from '@nestjs/common';

@Module({
    imports: [NotificationGateway,RideSocketGateway], 
  providers: [],
  controllers: [],
  exports: [],
})
export class WebSocketModule {}
