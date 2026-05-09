import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
//import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard('jwt'))
@Controller('warehouse/:warehouseId/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto, @Param('warehouseId') warehouseId: string) {
    return this.customerService.create(dto, warehouseId);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.customerService.findAll(req.user.id, +page, +limit, search);
  }

  @Get(':customerId')
  findOne(@Param('customerId') customerId: string, @Req() req) {
    return this.customerService.findOne(customerId, req.user.id); // ✅ fixed
  }

  @Patch(':customerId')
  update(
    @Param('customerId') customerId: string,
    @Body() dto: Partial<CreateCustomerDto>,
    @Req() req,
  ) {
    return this.customerService.update(customerId, dto, req.user.id); // ✅ fixed
  }

  @Delete(':customerId')
  remove(@Param('customerId') customerId: string, @Req() req) {
    return this.customerService.remove(customerId, req.user.id); // ✅ fixed
  }
}