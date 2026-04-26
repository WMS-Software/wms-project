
import { Body, Controller, Post } from '@nestjs/common';
import { BagService } from './bag.service';

@Controller('bags')
export class BagController {
    constructor(private readonly bagService : BagService) {} 

    @Post('scan') 
    scanBag(
        @Body('barcode') barcode: string,
        @Body('rackId') rackId: string,
    ) {
        return this.bagService.scanBag(barcode,rackId);
    }

}
