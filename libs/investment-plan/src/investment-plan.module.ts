import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentPlanService } from './investment-plan.service';
import { InvestmentPlanController } from './investment-plan.controller';

@Module({
  controllers: [InvestmentPlanController],
  providers: [InvestmentPlanService],
  exports: [InvestmentPlanService],
})
export class InvestmentPlanModule {}
