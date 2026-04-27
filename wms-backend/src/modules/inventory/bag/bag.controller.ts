
import { Body, Controller, Post } from '@nestjs/common';
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

    @Post('store') 
    async storeBag(
        @Body('barcode') barcode: string,
        @Body('rackId') rackId: string,
    ) {
        return this.bagservice.storeBag(barcode,rackId);
    }

    @Post('cancel')
    async cancellBag(
        @Body('barcode') barcode: string,
    ) {
        return this.bagservice.cancellBag(barcode);
    }

    @Post('dispatch')
    async dispatchBag(
        @Body('barcode') barcode: string,
    ) {
        return this.bagservice.dispatchBag(barcode);
    }
}
