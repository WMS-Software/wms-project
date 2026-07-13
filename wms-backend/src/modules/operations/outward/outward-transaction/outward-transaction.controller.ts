import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { OutwardTransactionService } from './outward-transaction.service';
import { CreateOutwardTransactionDto } from './dto/create-outward-transaction.dto';

@Controller('outward-transactions')
export class OutwardTransactionController {
  constructor(
    private readonly outwardTransactionService: OutwardTransactionService,
  ) {}

  @Post()
  createOutwardTransaction(@Body() dto: CreateOutwardTransactionDto) {
    return this.outwardTransactionService.createOutwardTransaction(dto);
  }

  @Get()
  getAllOutwardTransactions() {
    return this.outwardTransactionService.getAllOutwardTransactions();
  }

  @Get(':id')
getOutwardTransactionById(
  @Param('id') id: string,
) {
  return this.outwardTransactionService.getOutwardTransactionById(
    id,
  );
}

@Get(':id/items')
getOutwardTransactionItems(
  @Param('id') id: string,
) {
  return this.outwardTransactionService.getOutwardTransactionItems(
    id,
  );
}
  
}
