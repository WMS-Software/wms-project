
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LotService } from './lot.service';
import { CreateLotDto } from './dto/lot.dto';

@Controller('lot')
export class LotController {

    constructor(private readonly lotService: LotService) {}
    

    @Post(':warehouseId/:customerId/:inwardId')
    async createLot(
        @Body() dto: CreateLotDto,
        @Param('warehouseId') warehouseId: string,
        @Param('customerId') customerId: string,
        @Param('inwardId') inwardId: string
    ) {
        return this.lotService.createLot(
            dto,
            warehouseId,
            customerId,
            inwardId
        );
    }

    @Get(':warehouseId/:customerId')
    async findAllLots(
        @Param('warehouseId') warehouseId: string,
        @Param('customerId') customerId: string
    ) {
        return this.lotService.findAllLots(warehouseId, customerId);
    }



    @Get(':id')
    async findLotById(@Param('id') id: string) {
        return this.lotService.findLotById(id);
    }



    @Delete('delete/:id')
    async deleteLot(@Param('id') id: string) {
        return this.lotService.deleteLot(id);
    }
}
