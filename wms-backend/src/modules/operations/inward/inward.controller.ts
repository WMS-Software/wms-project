
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InwardService } from './inward.service';
import { createInwardDto } from './dto/createInwardDto';

@Controller('/warehouses/:warehouseId/customer/:customerId/inwards')
export class InwardController {
    constructor(private readonly inwardService: InwardService) {}

    // creating inward transaction
    @Post()
    create(
        @Body() dto: createInwardDto
    ) {
        return this.inwardService.createInward(dto)
    }

    // find inward by id
    @Get(':id')
    getbyId(@Param('id') id: string) {
        return this.inwardService.getInwardById(id)
    }

    // mark inward in progress
    @Patch(':id/in-progress')
    markInProgress(@Param('id') id: string) {
        return this.inwardService.inwardProgress(id);
    }

    @Patch(':id/complete')
    completeInward(@Param('id') id: string) {
        return this.inwardService.completeInward(id);
    }

}
