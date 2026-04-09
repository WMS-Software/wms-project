import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateRackDto {

  @IsNotEmpty()
  @IsNumber()
  rackNumber!: number;

  @IsNotEmpty()
  @IsString()
  chamberId!: string;
}