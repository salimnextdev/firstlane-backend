import { Module } from '@nestjs/common';
import { DurationService } from './duration.service';
import { DurationController } from './duration.controller';

@Module({
  controllers: [DurationController],
  providers: [DurationService],
})
export class DurationModule {}
