
import { Module } from '@nestjs/common';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChamberModule } from '../chamber/chamber.module';
import { Chamber } from '../chamber/entities/chamber.entity';
import { Rack } from './entities/rack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chamber, Rack])],
  controllers: [RackController],
  providers: [RackService],
  exports: [RackService],
})
export class RackModule {}
