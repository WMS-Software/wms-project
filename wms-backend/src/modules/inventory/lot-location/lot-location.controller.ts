import { Controller, Get, Param } from '@nestjs/common';
import { LotLocationService } from './lot-location.service';

@Controller('lot-location')
export class LotLocationController {
  constructor(private readonly lotLocationService: LotLocationService) {}

  @Get('lot/:lotId')
  getLotDistribution(@Param('lotId') lotId: string) {
    return this.lotLocationService.getLotDistribution(lotId);
  }

  @Get('free-racks/:chamberId')
  getFreeRacks(@Param('chamberId') chamberId: string) {
    return this.lotLocationService.getFreeRacks(chamberId);
  }

  @Get('suggest/:chamberId')
  suggestRack(@Param('chamberId') chamberId: string) {
    return this.lotLocationService.suggestRack(chamberId);
  }
}
// GET /lot-location/lot/:lotId
// GET /lot-location/free-racks/:chamberId
// GET /lot-location/suggest/:chamberId
