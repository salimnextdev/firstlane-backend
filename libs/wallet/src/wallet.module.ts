import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FlutterwaveService } from '@app/service/shared/payment/flutterwave';
import { NotificationGateway, NotificationService } from '@app/service';
import { WalletController } from './wallet.controller';
import { WebSocketGatewayService } from '@app/service';

@Module({
  controllers:[WalletController],
  providers: [WalletService, NotificationGateway, WebSocketGatewayService,
    FlutterwaveService,
    NotificationService,],
  exports: [WalletService],
})
export class WalletModule {}
