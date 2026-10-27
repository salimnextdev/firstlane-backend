import { Module } from '@nestjs/common';
import { PurposeService } from './purpose.service';
import { PurposeController } from './purpose.controller';

@Module({
  controllers: [PurposeController],
  providers: [PurposeService],
})
export class PurposeModule {}
