import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FlutterwaveService } from '@app/service/shared/payment/flutterwave';
import { NotificationGateway, NotificationService, TransactionNotificationService, SendMailService, SmsService } from '@app/service';
import { WalletController } from './wallet.controller';
import { WebSocketGatewayService } from '@app/service';

@Module({
  controllers:[WalletController],
  providers: [WalletService, NotificationGateway, WebSocketGatewayService,
    FlutterwaveService,
    NotificationService,
    TransactionNotificationService,
    SendMailService,
    SmsService,],
  exports: [WalletService],
})
export class WalletModule {}
