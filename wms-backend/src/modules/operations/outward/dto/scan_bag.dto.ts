import { IsNotEmpty, IsString } from "class-validator";

export class ScanBagDto {
  @IsNotEmpty()
  @IsString()
  barcode!: string;
}