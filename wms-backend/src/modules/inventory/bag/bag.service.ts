import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Bag } from './entities/bag.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LotCounter } from './entities/lot_counter.entity';
import { BagStatus } from './entities/bag_status.enum';
import { Rack } from '../rack/entities/rack.entity';
import { RackStatus } from '../rack/entities/rack_status.enum';

@Injectable()
export class BagService {
  constructor(
    @InjectRepository(Bag)
    private bagRepository: Repository<Bag>,

    @InjectRepository(LotCounter)
    private lotCounterRepo: Repository<LotCounter>,

    @InjectRepository(Rack)
    private rackRepository: Repository<Rack>,

    private dataSource: DataSource,
  ) {}

  async generateBag(lotId: string, qty: number): Promise<Bag[]> {     
    if (!lotId) {
      throw new Error('lotId is required');
    }

    if (!qty || qty <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    //  we apply lock to avoid race condition i give us max serial of lotid
    return await this.dataSource.transaction(async (manager) => {
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
          bagCode: `BAG-${lotId}-${serial}`,
          barcode: `BAG-${lotId}-${serial}`,
        });

        bags.push(bag);
      }

      try {
        await manager.save(Bag, bags);
      } catch (error) {
        throw new Error(`Failed to generate bags ${error.message}`);
      }

      return bags;
    });
  }

  async scanBag(barcode: string, rackId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const bagRepo = manager.getRepository(Bag);
      const rackRepo = manager.getRepository(Rack);
      const bag = await bagRepo.findOne({
        where: {barcode},
        lock: {mode: 'pessimistic_write'}
      })

      if(!bag) {
        throw new NotFoundException('Bag not found')
      }

      if(bag.status === BagStatus.cancelled) {
        throw new BadRequestException('Bag is Cancelled and cannot be store')
      }

      if(bag.status === BagStatus.stored) {
        throw new BadRequestException('Bag is already stored')
      }

      const rack = await rackRepo.findOne({
        where: { id: rackId },
        lock: {mode: 'pessimistic_write'}
      });

      if(!rack) {
        throw new NotFoundException('Location not found');
      }

      if(rack.status === RackStatus.full) {
        throw new BadRequestException('Rack is full');
      }

      rack.currentBags += 1;


      bag.status = BagStatus.stored;
      bag.rackId = rackId;

      await rackRepo.save(rack)
      await bagRepo.save(bag);

      return bag;

    })

  }

}
