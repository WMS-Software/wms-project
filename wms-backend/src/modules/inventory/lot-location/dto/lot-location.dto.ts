import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLotLocationDto {

  @IsNotEmpty()
  @IsString()
  lotId!: string;

  @IsNotEmpty()
  @IsString()
  rackId!: string;
}