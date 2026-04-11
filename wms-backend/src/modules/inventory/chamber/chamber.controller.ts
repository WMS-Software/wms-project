
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ChamberService } from './chamber.service';
import { CreateChamberDto } from './dto/chamber.dto';

//@UseGuards(AuthGuard('jwt'))
@Controller('levels/:levelId/chambers')
export class ChamberController {
    constructor(private readonly chamberService: ChamberService){}


    @Post()
        create(@Body() dto: CreateChamberDto, @Param('levelId') levelId:string){
            return this.chamberService.createChamber(dto, levelId);
        }
    
    
        @Get()
        findAllChambers(@Param('levelId') levelId: string){
            return this.chamberService.findAllChambers(levelId);
        }
    
    
        @Get(':chamberId')
        findChamberById(@Param('chamberId') chamberId: string){
            return this.chamberService.findChamberById(chamberId);
        }
    
    
        @Patch(':chamberId')
        updateChamber(@Param('chamberId') chamberId: string, @Body() dto: Partial<CreateChamberDto>){
            return this.chamberService.updateChamber(chamberId, dto);
        }
    
    
        @Delete(':chamberId')
        deleteChambeer(@Param('chamberId') chamberId: string){
            return this.chamberService.deleteChamber(chamberId);
        }

}
