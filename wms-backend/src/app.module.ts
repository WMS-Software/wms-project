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
import { CustomerModule } from './modules/partner/customer/customer.module';
import { InwardModule } from './modules/operations/inward/inward.module';
import { OutwardModule } from './modules/operations/outward/dispatch-session/dispatch-session.module';
import { LotModule } from './modules/inventory/lot/lot.module';
import { InwardConfirmModule } from './modules/operations/inward-confirm/inward-confirm.module';


@Module({
  imports: [
    DatabaseModule,

    // warehouse modules
    UserModule,
    AuthModule,

    // customer modules
    CustomerModule,

    // inventory modules
    BagModule,
    RackModule,
    LotModule,
    LotLocationModule,
    WarehouseModule,
    LevelModule,
    ChamberModule,

    // operations module
    InwardModule,
    InwardConfirmModule,
    OutwardModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}