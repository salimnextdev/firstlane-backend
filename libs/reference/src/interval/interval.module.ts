import { Module } from '@nestjs/common';
import { IntervalService } from './interval.service';
import { IntervalController } from './interval.controller';

@Module({
  controllers: [IntervalController],
  providers: [IntervalService],
})
export class IntervalModule {}
