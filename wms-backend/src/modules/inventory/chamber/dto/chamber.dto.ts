import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateChamberDto {

  @IsNotEmpty()
  @IsNumber()
  chamberNumber!: number;

  //validation lagani ki  min temp max temp se jyada nhii hona chahiye
  @IsNotEmpty()
  @IsNumber()
  minTemperature!: number;

  @IsNotEmpty()
  @IsNumber()
  maxTemperature!: number;
}