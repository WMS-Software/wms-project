import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';

export class CreateCustomerDto {

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 15)
  phone!: string;

  @IsOptional()
  @IsString()
  address?: string;
}