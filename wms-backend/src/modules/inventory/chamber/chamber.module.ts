
import { Module } from '@nestjs/common';
import { ChamberService } from './chamber.service';
import { ChamberController } from './chamber.controller';

@Module({
  controllers: [ChamberController],
  providers: [ChamberService],
  exports: [ChamberService],
})
export class ChamberModule {}
