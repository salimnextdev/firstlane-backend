import { NotificationGateway } from '@app/service';
import { WebSocketGatewayService } from '@app/service';
import { Module } from '@nestjs/common';

@Module({
    imports: [NotificationGateway,WebSocketGatewayService], 
  providers: [],
  controllers: [],
  exports: [],
})
export class WebSocketModule {}
