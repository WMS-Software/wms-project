import { Injectable } from '@nestjs/common';
import { Bag } from './entities/bag.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LotCounter } from './entities/lot_counter.entity';

@Injectable()
export class BagService {
  constructor(
    @InjectRepository(Bag)
    private bagRepository: Repository<Bag>,

    @InjectRepository(LotCounter)
    private lotCounterRepo: Repository<LotCounter>,

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
}
