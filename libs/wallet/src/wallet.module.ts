import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FlutterwaveService } from '@app/service/shared/payment/flutterwave';
import { NotificationGateway, NotificationService } from '@app/service';
import { WalletController } from './wallet.controller';

@Module({
  controllers:[WalletController],
  providers: [WalletService, NotificationGateway,  FlutterwaveService,
    NotificationService,],
  exports: [WalletService],
})
export class WalletModule {}
