import { IsString } from 'class-validator';

export class UnscanBagDto {
  @IsString()
  barcode !: string;
}