
import { Module } from '@nestjs/common';
import { BagService } from './bag.service';
import { BagController } from './bag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotCounter } from './entities/lot_counter.entity';
import { Bag } from './entities/bag.entity';
import { Rack } from '../rack/entities/rack.entity';
import { Lot } from '../lot/entities/lot.entity';
import { LotLocationModule } from '../lot-location/lot-location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bag, LotCounter, Rack, Lot]),
    LotLocationModule
  ],
  controllers: [BagController],
  providers: [BagService],
  exports: [BagService],
})
export class BagModule {}
