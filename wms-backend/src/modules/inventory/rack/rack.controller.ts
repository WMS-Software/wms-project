
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RackService } from './rack.service';
import { CreateRackDto } from './dto/rack.dto';


//@UseGuards(AuthGuard('jwt'))
@Controller('chambers/:chamberId/racks')
export class RackController {
    constructor(private readonly rackservice: RackService){}
    
    
        @Post()
            create(@Body() dto: CreateRackDto, @Param('chamberId') chamberId:string){
                return this.rackservice.createRack(dto, chamberId);
            }
        
        
            @Get()
            findAllRacks(@Param('chamberId') chamberId: string){
                return this.rackservice.findAllRacks(chamberId);
            }
        
        
            @Get(':rackId')
            findRackById(@Param('rackId') rackId: string){
                return this.rackservice.findRackById(rackId);
            }
        
        
            @Patch(':rackId')
            updateRack(@Param('rackId') rackId: string, @Body() dto: Partial<CreateRackDto>){
                return this.rackservice.updateRack(rackId, dto);
            }
        
        
            @Delete(':rackId')
            deleteRack(@Param('rackId') rackId: string){
                return this.rackservice.deleteRack(rackId);
            }
}
