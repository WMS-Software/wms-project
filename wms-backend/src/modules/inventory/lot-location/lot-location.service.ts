import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rack } from '../rack/entities/rack.entity';
import { Not, Repository } from 'typeorm';
import { Lot } from '../lot/entities/lot.entity';
import { LotLocation } from './entities/lot-location.entity';

@Injectable()
export class LotLocationService {
    constructor(
        @InjectRepository(Rack)
        private readonly rackRepo: Repository<Rack>,
        
        @InjectRepository(Lot)
        private  readonly lotRepo: Repository<Lot>,

        @InjectRepository(LotLocation)
        private  readonly lotLocationRepo: Repository<LotLocation>,
    ){}

    async getFreeRacks(chamberId: string):Promise<Rack[]>{

        const racks = await this.rackRepo.find({

            where:{
                chamberId, 
                status: Not('FULL')
            },

            order:{
                rackNumber:'ASC'
            }
        });

        return racks;
    }


    async validateLot(lotId: string): Promise<Lot>{

        const lot = await this.lotRepo.findOne({

            where:{
                id: lotId, 
                isActive: true
            }

        })

        if(!lot){
            throw new NotFoundException('Lot not found')
        }

        return lot;
    }


    async suggestRack(chamberId: string):Promise<Rack>{
        const racks = await this.getFreeRacks(chamberId);

        if(!racks.length){
            throw new BadRequestException('No racks empty');
        }

        return racks[0];
    }


    async assignRackToLot(lotId:string, chamberId: string){
        const lot = await this.validateLot(lotId);

        const rack = await this.suggestRack(chamberId);

        const existing = await this.lotLocationRepo.findOne({
            where: {lotId: lot.id, rackId: rack.id}
        })

        if(existing){
            throw new BadRequestException('Lot already exist in this rack');
        }

        const mapping = this.lotLocationRepo.create({
            lotId: lot.id,
            rackId: rack.id
        })

        await this.lotLocationRepo.save(mapping);

        return {
            message : "Rack assigned to lot",
            lot : lot.id,
            rack : rack.id,
            rackNumber: rack.rackNumber
        }
    }


    async updateRackStatus(){}


}
