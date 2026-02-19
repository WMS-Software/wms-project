
import { Module } from '@nestjs/common';
import { TransporterService } from './transporter.service';
import { TransporterController } from './transporter.controller';

@Module({
  controllers: [TransporterController],
  providers: [TransporterService],
  exports: [TransporterService],
})
export class TransporterModule {}
