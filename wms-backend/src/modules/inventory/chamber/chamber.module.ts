
import { Module } from '@nestjs/common';
import { ChamberService } from './chamber.service';
import { ChamberController } from './chamber.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../level/entities/level.entity';
import { Chamber } from './entities/chamber.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Level, Chamber])],
  controllers: [ChamberController],
  providers: [ChamberService],
  exports: [ChamberService],
})
export class ChamberModule {}
