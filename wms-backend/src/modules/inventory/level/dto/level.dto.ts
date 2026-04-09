import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateLevelDto {

  @IsNotEmpty()
  @IsNumber()
  levelNumber!: number;
}