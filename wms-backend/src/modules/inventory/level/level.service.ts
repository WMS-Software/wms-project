
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from './entities/level.entity';
import { Repository } from 'typeorm';
import { CreateLevelDto } from './dto/level.dto'
import { Warehouse } from '../warehouse/entities/warehouse.entity';

@Injectable()
export class LevelService {

    constructor(
        @InjectRepository(Level)
        private  readonly levelRepo: Repository<Level>,

        @InjectRepository(Warehouse)
        private  readonly warehouseRepo: Repository<Warehouse>
    ){}

    //Create Level 

    async createLevel(
        dto : CreateLevelDto,
        warehouseId : string
    ):Promise<Level>{


        try {
            const warehouse = await this.warehouseRepo.findOne({
                where: {
                    id: warehouseId,
                    isActive: true
                }
            })

            if(!warehouse){
                throw new NotFoundException('Warehouse not found');
            }

            const level = this.levelRepo.create({
                levelNumber: dto.levelNumber,
                warehouseId: warehouse.id,
        })

        return this.levelRepo.save(level);
        }

        catch (error:any) {
            console.error('Error in creating level:', error.message);
            
                  if (error instanceof NotFoundException) {
                    throw error;
                  }

                  if(error.code === '23505'){
                    throw new InternalServerErrorException(`level ${dto.levelNumber} already exists in this warehouse`);
                  }
            
                  throw new InternalServerErrorException('Failed to create level');
        }
    }


    //Find all levels




    async findAllLevels(warehouseId: string): Promise<Level[]>{
        const warehouse = await this.warehouseRepo.findOne({
                where: {
                    id: warehouseId,
                    isActive: true,
                }
            })

        if(!warehouse){
            throw new NotFoundException('Warehouse not found');
        }

        return this.levelRepo.find({where : {warehouseId: warehouse.id, isActive: true}});
    }


    //Find level by ID





    async findLevelById(id: string):Promise<Level>{
        const level = await this.levelRepo.findOne({where:{id: id, isActive: true}});

        if(!level){
            throw new NotFoundException('Level not found');
        }

        return level;
    }


    //Update level by ID




    async updateLevel(id: string, dto:Partial<CreateLevelDto>): Promise<Level>{
        
        const level = await this.findLevelById(id);

        //Agr new level number provided hoga toh he update hoga vrna agr undefined ya null hua toh purana level no. he rahega
        level.levelNumber = dto.levelNumber ?? level.levelNumber;

        try {
            return this.levelRepo.save(level);
        } catch (error:any) {
            if(error.code === '23505'){
                throw new InternalServerErrorException(`level ${dto.levelNumber} already exists in warehouse`);
            }

            throw new InternalServerErrorException('Failed in updating level');
        }
    }


    //Delete level by ID soft delete only





    async deleteLevel(id: string): Promise<{message: string}>{
        const level = await this.findLevelById(id);

        level.isActive = false;

        await this.levelRepo.save(level);
        return {message: 'Level deleted successfully'};
    }
}
