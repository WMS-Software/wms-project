

export class RackAdjustmentDto {
    rackId !: string;
    actualQty !: number;
}

export class ConfirmPutawayDto {
    adjustments !: RackAdjustmentDto[];
}