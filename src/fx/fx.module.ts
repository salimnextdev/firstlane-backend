import { Module } from '@nestjs/common';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';

@Module({
  controllers: [FxController],
  providers: [FxService],
})
export class FxModule {}
