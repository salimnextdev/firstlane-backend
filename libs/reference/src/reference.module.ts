import { Module } from '@nestjs/common';

import { PurposeModule } from './purpose/purpose.module';
import { DurationModule } from './duration/duration.module';
import { IntervalModule } from './interval/interval.module';
import { CollateralModule } from './collateral/collateral.module';

@Module({
  providers: [],
  exports: [],
  imports: [PurposeModule, DurationModule, IntervalModule, CollateralModule],
})
export class ReferenceModule {}
