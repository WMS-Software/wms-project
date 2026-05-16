import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { InwardConfirmService } from "./inward-confirm.service";
import { ConfirmPutawayDto } from "./dto/inward-confirm.dto";


@Controller('inward-confirm')
export class InwardConfirmController {
    constructor(private readonly inwardConfirmService: InwardConfirmService) {}

    @Get(':inwardId/preview')
    preview(
        @Param('inwardId') inwardId: string
    ) {
        return this.inwardConfirmService.preview(inwardId)
    }

    @Post(':inwardId/confirm')
    confirm (
        @Param('inwardId') inwardId: string,
        @Body() dto: ConfirmPutawayDto
    ) {
        return this.inwardConfirmService.confirmPutaway(inwardId,dto);
    }

}