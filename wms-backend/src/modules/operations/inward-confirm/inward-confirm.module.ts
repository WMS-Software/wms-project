import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InwardConfirmService } from './inward-confirm.service';

import { Inward } from '../inward/entities/inward.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { Rack } from 'src/modules/inventory/rack/entities/rack.entity';
import { InwardConfirmController } from './inward-confirm.controller';
import { LotLocationModule } from 'src/modules/inventory/lot-location/lot-location.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inward, Bag, Rack]),
    LotLocationModule  
],
  controllers: [InwardConfirmController],
  providers: [InwardConfirmService],
})
export class InwardConfirmModule {}