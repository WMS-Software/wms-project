
import { Module } from '@nestjs/common';
import { OutwardService } from './outward.service';
import { OutwardController } from './outward.controller';

@Module({
  controllers: [OutwardController],
  providers: [OutwardService],
  exports: [OutwardService],
})
export class OutwardModule {}
