import { Module } from '@nestjs/common';
import { LotLocationService } from './lot-location.service';
import { LotLocationController } from './lot-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rack } from '../rack/entities/rack.entity';
import { Lot } from '../lot/entities/lot.entity';
import { LotLocation } from './entities/lot-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rack,Lot,LotLocation])],
  providers: [LotLocationService],
  controllers: [LotLocationController]
})
export class LotLocationModule {}
