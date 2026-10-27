import { Module } from '@nestjs/common';

import { PurposeModule } from './purpose/purpose.module';
import { DurationModule } from './duration/duration.module';
import { IntervalModule } from './interval/interval.module';
import { CollateralModule } from './collateral/collateral.module';
import { CurrencyModule } from './currency/currency.module';
import { FxrateModule } from './fxrate/fxrate.module';
import { BankAccountModule } from './bank-account/bank-account.module';

@Module({
  providers: [],
  exports: [],
  imports: [PurposeModule, DurationModule, IntervalModule, CollateralModule, CurrencyModule, FxrateModule, BankAccountModule],
})
export class ReferenceModule {}
