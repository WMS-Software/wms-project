import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class RackAdjustmentDto {
  @IsUUID()
  @IsString()
  rackId!: string;

  @IsInt()
  @Min(0)
  actualQty!: number;
}

export class ConfirmPutawayDto {

      @IsOptional()

  @IsArray()

  @ValidateNested({ each: true })

  @Type(() => RackAdjustmentDto)
  adjustments!: RackAdjustmentDto[];
}
