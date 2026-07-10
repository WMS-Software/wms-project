
import { Module } from '@nestjs/common';
import { DispatchSessionService } from './dispatch-session.service';
import { DispatchSessionController } from './dispatch-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { DataSource } from 'typeorm';
import { Lot } from 'src/modules/inventory/lot/entities/lot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse,Customer,Bag,DataSource,Lot])],
  controllers: [DispatchSessionController],
  providers: [DispatchSessionService],
  exports: [DispatchSessionService],
})
export class DispatchSessionModule  {}
