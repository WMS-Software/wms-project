
import { Module } from '@nestjs/common';
import { BagService } from './bag.service';
import { BagController } from './bag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotCounter } from './entities/lot_counter.entity';
import { Bag } from './entities/bag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bag, LotCounter])
  ],
  controllers: [BagController],
  providers: [BagService],
  exports: [BagService],
})
export class BagModule {}
