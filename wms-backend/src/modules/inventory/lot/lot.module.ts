
import { Module } from '@nestjs/common';
import { LotService } from './lot.service';
import { LotController } from './lot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from './entities/lot.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { Inward } from 'src/modules/operations/inward/entities/inward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, Customer, Warehouse, Inward])],
  controllers: [LotController],
  providers: [LotService],
  exports: [LotService],
})
export class LotModule {}