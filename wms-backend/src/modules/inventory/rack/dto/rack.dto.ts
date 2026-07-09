import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateRackDto {

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  rackNumber!: number;

  @IsNotEmpty()
  @IsString()
  chamberId!: string;
}