import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/wareHouse.dto';
import { User } from 'src/modules/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  create(
    @Body() dto: CreateWarehouseDto,
    @Req() req: { user: User },
  ) {
    const userId =  req.user.id;
    return this.warehouseService.createWarehouse(dto, userId);
  }

  @Get()
  findAll() {
    return this.warehouseService.findAllWarehouse();
  }
  
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.warehouseService.findWarehouseById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateWarehouseDto>) {
    return this.warehouseService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id);
  }
}
