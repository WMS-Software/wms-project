import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('warehouses/:warehouseId/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(
    @Body() dto: CreateCustomerDto,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.customerService.create(dto, warehouseId);
  }

  @Get()
  findAll(@Param('warehouseId') warehouseId: string) {
    return this.customerService.findAll(warehouseId);
  }

  @Get(':customerId')
  findOne(@Param('customerId') customerId: string) {
    return this.customerService.findOne(customerId);
  }

  @Patch(':customerId')
  update(
    @Param('customerId') customerId: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    return this.customerService.update(customerId, dto);
  }

  @Delete(':customerId')
  remove(@Param('customerId') customerId: string) {
    return this.customerService.remove(customerId);
  }
}