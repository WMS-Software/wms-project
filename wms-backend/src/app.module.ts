import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BagModule } from './modules/inventory/bag/bag.module';
import { RackModule } from './modules/inventory/rack/rack.module';
import { LotLocationModule } from './modules/inventory/lot-location/lot-location.module';
import { WarehouseModule } from './modules/inventory/warehouse/warehouse.module';
import { LevelModule } from './modules/inventory/level/level.module';
import { ChamberModule } from './modules/inventory/chamber/chamber.module';


@Module({
  imports: [
    DatabaseModule,

    UserModule,
    AuthModule,

    BagModule,
    RackModule,

    LotLocationModule,
    WarehouseModule,
    LevelModule,
    ChamberModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}