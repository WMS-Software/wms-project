import { IsNotEmpty, IsString } from 'class-validator';

export class LinkLotDto {

  @IsNotEmpty()
  @IsString()
  lotId!: string;
}