import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LotLocationModule } from './modules/inventory/lot-location/lot-location.module';
import { WarehouseModule } from './modules/inventory/warehouse/warehouse.module';
import { LevelModule } from './modules/inventory/level/level.module';
import { ChamberModule } from './modules/inventory/chamber/chamber.module';
import { RackModule } from './modules/inventory/rack/rack.module';

@Module({
  imports: [DatabaseModule, LotLocationModule, WarehouseModule, LevelModule, ChamberModule, RackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
