import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DispatchSessionService } from './dispatch-session.service';

import { DispatchSessionDto } from './dto/dispatchSession.dto';
import { ScanBagDto } from './dto/scan_bag.dto';
import { UnscanBagDto } from './dto/unscan_bag.dto';
@Controller('outward')
export class DispatchSessionController {
  constructor(
    private readonly dispatchSessionService: DispatchSessionService,
  ) {}

  @Post()
  createDispatchSession(@Body() dto: DispatchSessionDto) {
    return this.dispatchSessionService.createDispatchSession(dto);
  }

  @Post(':sessionId/scan')
  scanBag(@Param('sessionId') sessionId: string, @Body() dto: ScanBagDto) {
    return this.dispatchSessionService.scanBag(sessionId, dto);
  }

  @Patch(':sessionId/unscan')
  unscanBag(@Param('sessionId') sessionId: string, @Body() dto: UnscanBagDto) {
    return this.dispatchSessionService.unscanBag(sessionId, dto);
  }

  @Patch(':sessionId/confirm')
  confirmDispatch(@Param('sessionId') sessionId: string) {
    return this.dispatchSessionService.confirmDispatch(sessionId);
  }

  @Delete(':sessionId')
  cancelDispatchSession(@Param('sessionId') sessionId: string) {
    return this.dispatchSessionService.cancelDispatchSession(sessionId);
  }

  @Get(':sessionId')
  getSessionDetails(@Param('sessionId') sessionId: string) {
    return this.dispatchSessionService.getSessionDetails(sessionId);
  }
}
