
import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { BagService } from './bag.service';

@Controller('bags')
export class BagController {
    constructor(private readonly bagservice : BagService) {}

    @Post('generate') 
    async generateBag (
        @Body('lotId') lotId : string,
        @Body('qty') qty: number,
    ) {
        return this.bagservice.generateBag(lotId,qty)
    }

    @Post(':barcode/store') 
    async storeBag(
        @Param('barcode') barcode: string,
        @Body('rackId') rackId: string,
    ) {
        return this.bagservice.storeBag(barcode,rackId);
    }

    @Patch(':barcode/cancel')
    async cancellBag(
        @Param('barcode') barcode: string,
    ) {
        return this.bagservice.cancelBag(barcode);
    }

    @Patch(':barcode/dispatch')
    async dispatchBag(
        @Param('barcode') barcode: string,
    ) {
        return this.bagservice.dispatchBag(barcode);
    }
}
