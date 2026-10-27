import { Module } from '@nestjs/common';
import { FxRateController } from './fxrate.controller';
import { FxRateService } from './fxrate.service';


@Module({
  controllers: [FxRateController],
  providers: [FxRateService],
})
export class FxrateModule {}
