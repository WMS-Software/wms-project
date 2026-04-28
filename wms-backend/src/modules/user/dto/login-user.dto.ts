import { IsOptional, IsString } from 'class-validator';

export class LoginUserDto {

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  warehouseCode?: string;
}