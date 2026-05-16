import { IsDateString, IsOptional } from "class-validator";


export class createInwardDto {

    @IsOptional()          // field can be omitted
    @IsDateString() 
    date ?: Date
}