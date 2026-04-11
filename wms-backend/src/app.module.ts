import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BagModule } from './modules/inventory/bag/bag.module';
import { RackModule } from './modules/inventory/rack/rack.module';


@Module({
  imports: [ DatabaseModule, BagModule, RackModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
