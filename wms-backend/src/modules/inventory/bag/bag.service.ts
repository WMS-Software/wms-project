import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Bag } from './entities/bag.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LotCounter } from './entities/lot_counter.entity';
import { BagStatus } from './entities/bag_status.enum';
import { Rack } from '../rack/entities/rack.entity';
import { Lot } from '../lot/entities/lot.entity';
import { RackStatus } from '../rack/entities/rack_status.enum';
import { LotLocationService } from '../lot-location/lot-location.service';

@Injectable()
export class BagService {
  constructor(
    @InjectRepository(Bag)
    private bagRepository: Repository<Bag>,

    @InjectRepository(LotCounter)
    private lotCounterRepo: Repository<LotCounter>,

    @InjectRepository(Rack)
    private rackRepository: Repository<Rack>,

    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,

    public lotLocationService : LotLocationService,

    private dataSource: DataSource,
  ) {}

  private async getBag(manager:any,barcode:string) : Promise<Bag> {

    const bag = await manager.getRepository(Bag).findOne({
      where : {barcode},
      lock : {mode : 'pessimistic_write'},
    })

    if(!bag) {
      throw new NotFoundException('Bag not found');
    }
    return bag
  }

  private async getLot(manager:any, lotId: string): Promise<Lot> {
    const lot = await manager.getRepository(Lot).findOne({
      where : {id: lotId},
      lock : {mode: 'pessimistic_write'},
    })

    if(!lot) throw new NotFoundException('Lot not found');
    return lot;
  }

  private async getRack(manager:any, rackId: string) : Promise<Rack> {
    const rack = await manager.getRepository(Rack).findOne({
      where: {id: rackId},
      lock: {mode: 'pessimistic_write'},
    })
    if(!rack) throw new NotFoundException('Rack not found');
    return rack;
  }

  async generateBag(lotId: string, qty: number): Promise<Bag[]> {     
    if (!lotId) {
      throw new Error('lotId is required');
    }

    if (!qty || qty <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    //  we apply lock to avoid race condition i give us max serial of lotid
    return await this.dataSource.transaction(async (manager) => {

      // finding lotNumber/lotCode
      const lot = await this.getLot(manager,lotId);

      //fetching counter
      let counter = await manager.findOne(LotCounter, {
        where: { lotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!counter) {
        try {
          counter = manager.create(LotCounter, {
            lotId,
            currentSerial: 0,
          });
          await manager.save(counter);
        } catch (error) {
          counter = await manager.findOne(LotCounter, {
            where: { lotId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!counter) {
            throw new Error('Failed to initialize lot counter');
          }

        }
      }

      const startSerial = counter.currentSerial + 1;
      const endSerial = counter.currentSerial + qty;

      counter.currentSerial = endSerial;
      await manager.save(counter);

      const bags: Bag[] = [];

      for (let curr = startSerial; curr <= endSerial; curr++) {
        const serial = curr.toString().padStart(5, '0');

        const bag = manager.create(Bag, {
          lotId,
          serial: curr,
          bagCode: `BAG-${lot.lotCode}-${serial}`,
          barcode: `BAG-${lot.lotCode}-${serial}`,
          status: BagStatus.pending,
        });

        bags.push(bag);
      }

      try {
        await manager.save(Bag, bags);
      } catch (error) {
        if(error instanceof Error) {
          throw new Error(`Failed to generate bags ${error.message}`);
        } else {
          throw new Error(`Failed to generate bags`);
        }
      }

      return bags;
    });
  }

  async storeBag(barcode: string, rackId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const bagRepo = manager.getRepository(Bag);
      const rackRepo = manager.getRepository(Rack);

      const bag = await this.getBag(manager,barcode);

      if(bag.status === BagStatus.cancelled) {
        throw new BadRequestException('Bag is Cancelled and cannot be store')
      }

      if(bag.status === BagStatus.stored) {
        throw new BadRequestException('Bag is already stored')
      }

      if(bag.status === BagStatus.dispatched) {
        throw new BadRequestException('Bag is dispatched')
      }

      const rack = await this.getRack(manager,rackId);

      if(rack.status === RackStatus.full) {
        throw new BadRequestException('Rack is full');
      }

      if(rack.status === RackStatus.blocked) {
        throw new BadRequestException('Rack is blocked');
      }

      // if(rack.currentBags >= rack.capacity) {
      //   throw new BadRequestException('Rack is full');
      // }

      // console.log('before', rack.currentBags);
      // rack.currentBags += 1;
      // console.log('after', rack.currentBags);




      bag.status = BagStatus.stored;
      bag.rackId = rackId;
      bag.scannedAt = new Date();

      // await rackRepo.save(rack);
      await bagRepo.save(bag);

      await this.lotLocationService.syncRackOccupancy(
   manager,
   new Set([rackId])
)

      return bag;

    })

  }

  async cancelBag(barcode:string) {
    return await this.dataSource.transaction(async (manager) => {

      const bag = await this.getBag(manager,barcode);

      if(bag.status === BagStatus.cancelled) {
        throw new BadRequestException('Bag already cancelled');
      }

      if(bag.status === BagStatus.stored) {
        throw new BadRequestException('stored bag cannot be cancelled');
      }

      if(bag.status === BagStatus.dispatched) {
        throw new BadRequestException('dispatched bag cannot be cancelled');
      }

      if(bag.status !== BagStatus.pending) {
        throw new BadRequestException('only pending bags can be cancelled');
      }

      bag.status = BagStatus.cancelled;
      bag.cancelledAt = new Date();

      await manager.save(bag);

      return;
    })
  }

  async dispatchBag(barcode:string) {
    return await this.dataSource.transaction(async (manager)=> {
      const bag = await this.getBag(manager,barcode);
      
      if(bag.status === BagStatus.cancelled) {
        throw new BadRequestException('Cancelled bag cannot be dispatched');
      }

      if(bag.status === BagStatus.dispatched) {
        throw new BadRequestException('Bag is already dispatched');
      }
      
      if(!bag.rackId) {
        throw new BadRequestException('Bag is not assigned to any rack');
      }

      if(bag.status !== BagStatus.stored) {
        throw new BadRequestException('Only stored bags can be dispatched');
      }


      const rack = await this.getRack(manager,bag.rackId);

      if(rack.currentBags <= 0) {
        throw new BadRequestException('Rack has no bag to dispatch');
      }

      // rack.currentBags -= 1;

      // if(rack.currentBags === 0) {
      //   rack.status = RackStatus.empty;
      // } else {
      //   rack.status = RackStatus.available;
      // }

      bag.status = BagStatus.dispatched;
      bag.dispatchedAt = new Date();

      // await manager.save(rack);
      await manager.save(bag);

  await this.lotLocationService.syncRackOccupancy(
   manager,
   new Set([rack.id])
)

      return bag;

    })
  }

}
