import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLotDto {
  @IsNotEmpty()
  @IsString()
  lotNumber!: string;

  @IsNotEmpty()
  @IsString()
  typeOfItem!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  initialQuantity!: number;
}
