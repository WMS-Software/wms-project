import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rack } from '../rack/entities/rack.entity';
import { Not, Repository } from 'typeorm';
import { Lot } from '../lot/entities/lot.entity';
import { LotLocation } from './entities/lot-location.entity';
import { RackStatus } from '../rack/entities/rack_status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class LotLocationService {
    constructor(
        @InjectRepository(Rack)
        private readonly rackRepo: Repository<Rack>,
        
        @InjectRepository(Lot)
        private  readonly lotRepo: Repository<Lot>,

        @InjectRepository(LotLocation)
        private  readonly lotLocationRepo: Repository<LotLocation>,

        private readonly dataSource: DataSource,
    ){}

    async getFreeRacks(chamberId: string):Promise<Rack[]>{

        const racks = await this.rackRepo.find({

            where:{
                chamberId, 
                status: Not(RackStatus.full),
                isBusy: false
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


    // async assignRackToLot(lotId:string, chamberId: string){
    //     const lot = await this.validateLot(lotId);

    //     const rack = await this.suggestRack(chamberId);

    //     const existing = await this.lotLocationRepo.findOne({
    //         where: {lotId: lot.id, rackId: rack.id}
    //     })

    //     if(existing){
    //         throw new BadRequestException('Lot already exist in this rack');
    //     }

    //     const mapping = this.lotLocationRepo.create({
    //         lotId: lot.id,
    //         rackId: rack.id
    //     })

    //     await this.lotLocationRepo.save(mapping);
    //     await this.updateRackStatus(rack.id);

    //     return {
    //         message : "Rack assigned to lot",
    //         lot : lot.id,
    //         rack : rack.id,
    //         rackNumber: rack.rackNumber
    //     }
    // }





    async assignRackToLot(
  lotId: string,
  rackId: string
) {


    

  const qr = this.dataSource.createQueryRunner();

  await qr.connect();
  await qr.startTransaction();

  try {

    // ✅ validate lot
    const lot = await qr.manager.findOne(Lot,{
      where:{ id: lotId, isActive:true }
    });

    if(!lot)
      throw new NotFoundException('Lot not found');


    // LOCK RACK WITHOUT WAITING


    const rack = await qr.manager
      .createQueryBuilder(Rack,'rack')
      .setLock('pessimistic_write')
      .setOnLocked('nowait')   // KEY LINE
      .where('rack.id = :rackId',{rackId})
      .getOne();



    if(!rack)
      throw new NotFoundException('Rack not found');

    if(rack.status === RackStatus.full)
      throw new BadRequestException('Rack already full');


    if (rack.isBusy) {
         throw new BadRequestException(
        'Rack currently in operation'
    );
    }


    // duplicate protection
    const existing = await qr.manager.findOne(
      LotLocation,
      { where:{ lotId, rackId } }
    );




    if(existing)
      throw new BadRequestException(
        'Lot already exists in rack'
      );


    // assign mapping
    const mapping = qr.manager.create(LotLocation,{
      lotId,
      rackId
    });

    await qr.manager.save(mapping);

    rack.isBusy = true;
    await qr.manager.save(rack);


    // update status safely
    const lotCount = await qr.manager.count(
      LotLocation,
      { where:{ rackId } }
    );

    rack.status =
      lotCount === 0
        ? RackStatus.empty
        : RackStatus.available;

    await qr.manager.save(rack);

    await qr.commitTransaction();

    return {
      message:'Rack assigned successfully'
    };

  } catch(error:any){

    await qr.rollbackTransaction();

    // important handling
    if(error.code === '55P03'){
      throw new BadRequestException(
        'Rack currently being used by another operator'
      );
    }

    throw error;

  } finally {

    await qr.release();
  }
}




async releaseRack(rackId: string){

 const rack = await this.rackRepo.findOne({
   where:{id:rackId}
 });

 if(!rack)
   throw new NotFoundException('Rack not found');

 rack.isBusy = false;

 await this.rackRepo.save(rack);
}





    async updateRackStatus(rackId: string): Promise<void> {

    const rack = await this.rackRepo.findOne({
        where:{ id: rackId }
    });

    if(!rack){
        throw new NotFoundException('Rack not found');
    }

    const lotCount = await this.lotLocationRepo.count({
        where:{ rackId }
    });

    if(lotCount === 0){
        rack.status = RackStatus.empty;
    }
    else{
        rack.status = RackStatus.available;
    }

    await this.rackRepo.save(rack);
}

  async markRackFull(rackId: string): Promise<void> {

    const rack = await this.rackRepo.findOne({
        where:{ id: rackId }
    });

    if(!rack){
        throw new NotFoundException('Rack not found');
    }

    rack.status = RackStatus.full;
    await this.rackRepo.save(rack);
}

 async removeLotFromRack(lotId: string, rackId: string): Promise<void> {

    const mapping = await this.lotLocationRepo.findOne({
        where: { lotId, rackId }
    });

    if(!mapping){
        throw new NotFoundException('Lot not found in the specified rack');
    }

    await this.lotLocationRepo.remove(mapping);
    await this.updateRackStatus(rackId);
}

async markRackEmpty(rackId: string): Promise<void> {

    const rack = await this.rackRepo.findOne({
        where:{ id: rackId }
    });

    if(!rack){
        throw new NotFoundException('Rack not found');
    }

    const lotCount = await this.lotLocationRepo.count({
        where:{ rackId }
    });

    if(lotCount > 0){
        throw new BadRequestException(
            'Rack still contains lots'
        );
    }

    rack.status = RackStatus.empty;

    await this.rackRepo.save(rack);
}
}
