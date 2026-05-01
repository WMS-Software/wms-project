
import { Module } from '@nestjs/common';
import { InwardService } from './inward.service';
import { InwardController } from './inward.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Inward } from './entities/inward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer,Warehouse,Inward])],
  controllers: [InwardController],
  providers: [InwardService],
  exports: [InwardService],
})
export class InwardModule {}
