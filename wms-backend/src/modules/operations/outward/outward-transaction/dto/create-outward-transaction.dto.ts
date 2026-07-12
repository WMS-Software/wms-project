import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateOutwardTransactionDto {

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  dispatchSessionIds!: string[];

  @IsOptional()
  remarks?: string
}