/**
 * TEMPORARY IMPLEMENTATION (DEVELOPMENT PHASE)
 *
 * Currently APIs accept warehouseId / levelId directly from URL params
 * only for module development and API testing.
 *
 * Proper authorization & ownership validation is NOT implemented yet.
 *
 * FUTURE PLAN:
 * - Extract warehouse context from authenticated user (JWT)
 * - Validate resource ownership (User → Warehouse → Level → Chamber)
 * - Prevent cross-warehouse access
 * - Implement multi-tenant security guard
 * 
 * after completing all the modules this thing will be added in all the modules like isme level id dekr check hoga ki level exist krta 
 * hai aur active hai phir uspr chamberId use krke update aur delete jaise operations perform honge
 */


import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from '../level/entities/level.entity';
import { Chamber } from './entities/chamber.entity';
import { Repository } from 'typeorm';
import { CreateChamberDto } from './dto/chamber.dto';

@Injectable()
export class ChamberService {
    constructor(
            @InjectRepository(Level)
            private  readonly levelRepo: Repository<Level>,
    
            @InjectRepository(Chamber)
            private  readonly chamberRepo: Repository<Chamber>
        ){}
    
        //Create Level 
    
        async createChamber(
            dto : CreateChamberDto,
            levelId : string
        ):Promise<Chamber>{
    
    
            try {
                const level = await this.levelRepo.findOne({
                    where: {
                        id: levelId,
                        isActive: true
                    }
                })
    
                if(!level){
                    throw new NotFoundException('Level not found');
                }
    
                const chamber = this.chamberRepo.create({
                    ...dto, levelId
            })
    
            return this.chamberRepo.save(chamber);
            }
    
            catch (error:any) {
                console.error('Error in creating chamber:', error.message);
                
                      if (error instanceof NotFoundException) {
                        throw error;
                      }
    
                      if(error.code === '23505'){
                        throw new InternalServerErrorException(`Chamber ${dto.chamberNumber} already exists in this level`);
                      }
                
                      throw new InternalServerErrorException('Failed to create chamber');
            }
        }
    
    
        //Find all levels
    
    
    
    
        async findAllChambers(levelId: string): Promise<Chamber[]>{
            const level = await this.levelRepo.findOne({
                    where: {
                        id: levelId,
                        isActive: true,
                    }
                })
    
            if(!level){
                throw new NotFoundException('level not found');
            }
    
            return this.chamberRepo.find({where : {levelId: level.id, isActive: true}});
        }
    
    
        //Find level by ID
    
    
    
    
    
        async findChamberById(id: string):Promise<Chamber>{
            const chamber = await this.chamberRepo.findOne({where:{id: id, isActive: true}});
    
            if(!chamber){
                throw new NotFoundException('Chamber not found');
            }
    
            return chamber;
        }
    
    
        //Update level by ID
    
    
    
    
        async updateChamber(id: string, dto:Partial<CreateChamberDto>): Promise<Chamber>{
            
            const chamber = await this.findChamberById(id);
    
            //Agr new level number provided hoga toh he update hoga vrna agr undefined ya null hua toh purana level no. he rahega
            chamber.chamberNumber = dto.chamberNumber ?? chamber.chamberNumber;
            chamber.minTemperature = dto.minTemperature ?? chamber.minTemperature;
            chamber.maxTemperature = dto.maxTemperature ?? chamber.maxTemperature;
    
            try {
                return this.chamberRepo.save(chamber);
            } catch (error:any) {
                if(error.code === '23505'){
                    throw new InternalServerErrorException(`Chamber ${dto.chamberNumber} already exists in level`);
                }
    
                throw new InternalServerErrorException('Failed in updating chamber');
            }
        }
    
    
        //Delete level by ID soft delete only
    
    
    
    
    
        async deleteChamber(id: string): Promise<{message: string}>{
            const chamber = await this.findChamberById(id);
    
            chamber.isActive = false;
    
            await this.chamberRepo.save(chamber);
            return {message: 'Chamber deleted successfully'};
        }
}
