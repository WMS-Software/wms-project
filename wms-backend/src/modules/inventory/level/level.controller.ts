//User authorise bhi krna hai sb mei abhi vo bacha hai 



import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/level.dto';
import { AuthGuard } from '@nestjs/passport';

//@UseGuards(AuthGuard('jwt'))
@Controller('warehouses/:warehouseId/levels')
export class LevelController {
    constructor(private readonly levelService: LevelService){}


    @Post()
    create(@Body() dto: CreateLevelDto, @Param('warehouseId') warehouseId:string){
        return this.levelService.createLevel(dto, warehouseId);
    }


    @Get()
    findAllLevels(@Param('warehouseId') warehouseId: string){
        return this.levelService.findAllLevels(warehouseId);
    }


    @Get(':levelId')
    findLevelById(@Param('levelId') levelId: string){
        return this.levelService.findLevelById(levelId);
    }


    @Patch(':levelId')
    updateLevel(@Param('levelId') levelId: string, @Body() dto: Partial<CreateLevelDto>){
        return this.levelService.updateLevel(levelId, dto);
    }


    @Delete(':levelId')
    deleteLevel(@Param('levelId') levelId: string){
        return this.levelService.deleteLevel(levelId);
    }
}
