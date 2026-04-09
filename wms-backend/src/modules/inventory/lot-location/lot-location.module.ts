import { Module } from '@nestjs/common';
import { LotLocationService } from './lot-location.service';
import { LotLocationController } from './lot-location.controller';

@Module({
  providers: [LotLocationService],
  controllers: [LotLocationController]
})
export class LotLocationModule {}
