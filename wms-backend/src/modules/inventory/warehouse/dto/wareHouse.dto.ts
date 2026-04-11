import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateWarehouseDto {

  @IsNotEmpty()
  @IsString()
  warehouseName!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @Matches(/^[1-9][0-9]{5}$/, {
    message: 'Pincode must be a valid 6-digit Indian pincode',
  })
  pincode!: string;
}