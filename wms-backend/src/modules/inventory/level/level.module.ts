
import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { Level } from './entities/level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Level])],
  controllers: [LevelController],
  providers: [LevelService],
  exports: [LevelService],
})
export class LevelModule {}
