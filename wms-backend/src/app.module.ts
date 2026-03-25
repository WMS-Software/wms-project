import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BagModule } from './modules/inventory/bag/bag.module';


@Module({
  imports: [ DatabaseModule, BagModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
