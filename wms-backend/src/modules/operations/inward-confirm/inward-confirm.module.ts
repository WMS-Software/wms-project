import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InwardConfirmService } from './inward-confirm.service';

import { Inward } from '../inward/entities/inward.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { Rack } from 'src/modules/inventory/rack/entities/rack.entity';
import { InwardConfirmController } from './inward_confirm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inward, Bag, Rack])],
  controllers: [InwardConfirmController],
  providers: [InwardConfirmService],
})
export class InwardConfirmModule {}