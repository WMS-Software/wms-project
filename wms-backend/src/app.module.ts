import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LotLocationModule } from './modules/inventory/lot-location/lot-location.module';

@Module({
  imports: [DatabaseModule, LotLocationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
