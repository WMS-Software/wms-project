
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chamber } from '../chamber/entities/chamber.entity';
import { Repository } from 'typeorm';
import { Rack } from './entities/rack.entity';
import { CreateRackDto } from './dto/rack.dto';

@Injectable()
export class RackService {
    constructor(
                @InjectRepository(Chamber)
                private  readonly chamberRepo: Repository<Chamber>,
        
                @InjectRepository(Rack)
                private  readonly rackRepo: Repository<Rack>
            ){}




            async createRack(
                        dto : CreateRackDto,
                        chamberId : string
                    ):Promise<Rack>{
                
                
                        try {
                            const chamber = await this.chamberRepo.findOne({
                                where: {
                                    id: chamberId,
                                    isActive: true
                                }
                            })
                
                            if(!chamber){
                                throw new NotFoundException('chamber not found');
                            }
                
                            const rack = this.rackRepo.create({
                                ...dto, chamberId
                        })
                
                        return this.rackRepo.save(rack);
                        }
                
                        catch (error:any) {
                            console.error('Error in creating rack:', error.message);
                            
                                  if (error instanceof NotFoundException) {
                                    throw error;
                                  }
                
                                  if(error.code === '23505'){
                                    throw new InternalServerErrorException(`Rack ${dto.rackNumber} already exists in this chamber`);
                                  }
                            
                                  throw new InternalServerErrorException('Failed to create rack');
                        }
                    }
                
                
                    //Find all levels
                
                
                
                
                    async findAllRacks(chamberId: string): Promise<Rack[]>{
                        const chamber = await this.chamberRepo.findOne({
                                where: {
                                    id: chamberId,
                                    isActive: true,
                                }
                            })
                
                        if(!chamber){
                            throw new NotFoundException('chamber not found');
                        }
                
                        return this.rackRepo.find({where : {chamberId: chamber.id, isActive: true}});
                    }
                
                
                    //Find level by ID
                
                
                
                
                
                    async findRackById(id: string):Promise<Rack>{
                        const rack = await this.rackRepo.findOne({where:{id: id, isActive: true}});
                
                        if(!rack){
                            throw new NotFoundException('Rack not found');
                        }
                
                        return rack;
                    }
                
                
                    //Update level by ID
                
                
                
                
                    async updateRack(id: string, dto:Partial<CreateRackDto>): Promise<Rack>{
                        
                        const rack = await this.findRackById(id);
                
                        //Agr new level number provided hoga toh he update hoga vrna agr undefined ya null hua toh purana level no. he rahega
                        rack.rackNumber = dto.rackNumber ?? rack.rackNumber;
                
                        try {
                            return this.rackRepo.save(rack);
                        } catch (error:any) {
                            if(error.code === '23505'){
                                throw new InternalServerErrorException(`Rack ${dto.rackNumber} already exists in level`);
                            }
                
                            throw new InternalServerErrorException('Failed in updating rack');
                        }
                    }
                
                
                    //Delete level by ID soft delete only
                
                
                
                
                
                    async deleteRack(id: string): Promise<{message: string}>{
                        const rack = await this.findRackById(id);
                
                        rack.isActive = false;
                
                        await this.rackRepo.save(rack);
                        return {message: 'Rack deleted successfully'};
                    }
}
