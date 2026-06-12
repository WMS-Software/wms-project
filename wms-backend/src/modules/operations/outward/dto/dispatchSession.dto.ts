import {
  IsInt,
  IsNotEmpty,
  isNotEmpty,
  isString,
  IsUUID,
  isUUID,
  Min,
} from 'class-validator';

export class DispatchSessionDto {
  @IsNotEmpty()
  @IsUUID()
  lotId!: string;

  @IsNotEmpty()
  @IsUUID()
  warehouseId!: string;

  @IsNotEmpty()
  @IsUUID()
  customerId!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  requiredQty!: number;
}
