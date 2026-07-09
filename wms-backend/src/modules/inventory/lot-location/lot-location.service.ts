import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rack } from '../rack/entities/rack.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { Lot } from '../lot/entities/lot.entity';
import { LotLocation } from './entities/lot-location.entity';
import { RackStatus } from '../rack/entities/rack_status.enum';
import { DataSource } from 'typeorm';
import { Bag } from '../bag/entities/bag.entity';
import { BagStatus } from '../bag/entities/bag_status.enum';

@Injectable()
export class LotLocationService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,

    @InjectRepository(Lot)
    private readonly lotRepo: Repository<Lot>,

    @InjectRepository(LotLocation)
    private readonly lotLocationRepo: Repository<LotLocation>,

    private readonly dataSource: DataSource,
  ) {}

  async getFreeRacks(chamberId: string): Promise<Rack[]> {
    const racks = await this.rackRepo.find({
      where: {
        chamberId,
        status: Not(RackStatus.full),
        isBusy: false,
      },

      order: {
        rackNumber: 'ASC',
      },
    });

    return racks;
  }

  async validateLot(lotId: string): Promise<Lot> {
    const lot = await this.lotRepo.findOne({
      where: {
        id: lotId,
        isActive: true,
      },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    return lot;
  }

  async suggestRack(chamberId: string): Promise<Rack> {
    const racks = await this.getFreeRacks(chamberId);

    if (!racks.length) {
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

  async commitLotDistribution(manager: EntityManager, lotId: string, rackId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // const qr = this.dataSource.createQueryRunner();

    // await qr.connect();
    // await qr.startTransaction();

    try {
      // ✅ validate lot
      const lot = await manager.findOne(Lot, {
        where: { id: lotId, isActive: true },
      });

      if (!lot) throw new NotFoundException('Lot not found');

      // LOCK RACK WITHOUT WAITING

      const rack = await manager
        .createQueryBuilder(Rack, 'rack')
        .setLock('pessimistic_write')
        .setOnLocked('nowait') // KEY LINE
        .where('rack.id = :rackId', { rackId })
        .getOne();

      if (!rack) throw new NotFoundException('Rack not found');

      if (rack.status === RackStatus.full)
        throw new BadRequestException('Rack already full');

      if (rack.status === RackStatus.blocked) {
        throw new BadRequestException('Rack is blocked');
      }

      if (rack.isBusy) {
        throw new BadRequestException('Rack currently in operation');
      }

      rack.isBusy = true;
      await manager.save(rack);

      // check existing mapping
      let mapping = await manager.findOne(LotLocation, {
        where: { lotId, rackId },
      });

      // if (existing) throw new BadRequestException('Lot already exists in rack');

      // increses existing quantity
      if (mapping) {
        mapping.quantity += quantity;
      } else {
        // create new distribution row
        mapping = manager.create(LotLocation, {
          lotId,
          rackId,
          quantity,
        });
      }

      await manager.save(mapping);
      // await qr.commitTransaction();

      return {
        message: 'Lot distribution succsesfully',
        lotId,
        rackId,
        quantity: mapping.quantity,
      };

      // assign mapping
      // const mapping = qr.manager.create(LotLocation, {
      //   lotId,
      //   rackId,
      // });

      // update status safely
      // const lotCount = await qr.manager.count(LotLocation, {
      //   where: { rackId },
      // });

      // rack.status = lotCount === 0 ? RackStatus.empty : RackStatus.available;

      // await qr.manager.save(rack);

      // await qr.commitTransaction();

      // return {
      //   message: 'Rack assigned successfully',
      // };
    } catch (error: any) {
      // await qr.rollbackTransaction();

      // important handling
      if (error.code === '55P03') {
        throw new BadRequestException(
          'Rack currently being used by another operator',
        );
      }

      throw error;
    } finally {
      // await qr.release();
    }
  }

  async upsertLotDistribution(
   manager: EntityManager,
   lotId: string,
   rackId: string,
   quantity: number,
) {

   if (quantity <= 0) {
      throw new BadRequestException(
         'Quantity must be greater than 0',
      );
   }

   let mapping = await manager.findOne(LotLocation, {
      where: { lotId, rackId },
      lock: {
         mode: 'pessimistic_write',
      },
   });

   if (mapping) {

      mapping.quantity = quantity;

   } else {

      mapping = manager.create(LotLocation, {
         lotId,
         rackId,
         quantity,
      });

   }

   await manager.save(mapping);

   return mapping;
}

  async releaseRack(rackId: string) {
    const rack = await this.rackRepo.findOne({
      where: { id: rackId },
    });

    if (!rack) throw new NotFoundException('Rack not found');

    rack.isBusy = false;

    await this.rackRepo.save(rack);

    return {
      message: 'Rack released successfully',
    };
  }

  async updateRackStatus(rackId: string): Promise<void> {
    const rack = await this.rackRepo.findOne({
      where: { id: rackId },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    // const lotCount = await this.lotLocationRepo.count({
    //   where: { rackId },
    // });

    // if (lotCount === 0) {
    //   rack.status = RackStatus.empty;
    // } else {
    //   rack.status = RackStatus.available;
    // }

    if (rack.status === RackStatus.full) {
      return;
    }

    // system-derived empty/available
    if (rack.currentBags <= 0) {
      rack.status = RackStatus.empty;
    } else {
      rack.status = RackStatus.available;
    }

    await this.rackRepo.save(rack);
  }

  async markRackFull(rackId: string): Promise<void> {
    const rack = await this.rackRepo.findOne({
      where: { id: rackId },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    rack.status = RackStatus.full;
    await this.rackRepo.save(rack);
  }

  // async removeLotFromRack(lotId: string, rackId: string, quantity: number): Promise<void> {
  //   let mapping = await this.lotLocationRepo.findOne({
  //     where: { lotId, rackId },
  //   });

  //   mapping.quantity -= quantity

  //   if (!mapping) {
  //     throw new NotFoundException('Lot not found in the specified rack');
  //   }

  //   await this.lotLocationRepo.remove(mapping);
  //   await this.updateRackStatus(rackId);
  // }

  async removeLotFromRack(
    manager: EntityManager,
    lotId: string,
    rackId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // const qr = this.dataSource.createQueryRunner();

    // await qr.connect();
    // await qr.startTransaction();

    try {
      // lock mapping row
      const mapping = await manager.findOne(LotLocation, {
        where: { lotId, rackId },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!mapping) {
        throw new NotFoundException('Lot not found in specified rack');
      }

      // prevent negative quantity
      if (mapping.quantity < quantity) {
        throw new BadRequestException(
          'Removal quantity exceeds stored quantity',
        );
      }

      // reduce quantity
      mapping.quantity -= quantity;

      // remove row only if empty
      if (mapping.quantity === 0) {
        await manager.remove(mapping);
      } else {
        await manager.save(mapping);
      }

      // await qr.commitTransaction();
    } catch (error) {
      // await qr.rollbackTransaction();
      throw error;
    } finally {
      // await qr.release();
    }
  }

  async markRackEmpty(rackId: string): Promise<void> {
    const rack = await this.rackRepo.findOne({
      where: { id: rackId },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    // const lotCount = await this.lotLocationRepo.count({
    //   where: { rackId },
    // });

    // if (lotCount > 0) {
    //   throw new BadRequestException('Rack still contains lots');
    // }

    if (rack.currentBags > 0) {
    throw new BadRequestException(
      'Rack still contains bags',
    );
  }

    rack.status = RackStatus.empty;

    await this.rackRepo.save(rack);
  }

  async getLotDistribution(lotId: string) {

  await this.validateLot(lotId);

  const distribution = await this.lotLocationRepo.find({
    where: { lotId },
    relations: ['rack'],
    order: {
      rack: {
        rackNumber: 'ASC',
      },
    },
  });

  const totalBags = distribution.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return {
    lotId,
    totalBags,
    locations: distribution.map((item) => ({
      rackId: item.rackId,
      rackNumber: item.rack.rackNumber,
      quantity: item.quantity,
    })),
  };
}

 async syncRackOccupancy(
  manager: any,
  rackIds: Set<string>,
) {
  for (const rackId of rackIds) {

    const rack = await manager.getRepository(Rack).findOne({
      where: { id: rackId },
    });

    if (!rack) continue;

    const count = await manager.getRepository(Bag).count({
      where: {
        rackId,
        status: BagStatus.stored,
      },
    });

    let status = RackStatus.available;

    if (count === 0) {
      status = RackStatus.empty;
    }

    await manager.getRepository(Rack).update(
      { id: rackId },
      {
        currentBags: count,
        status,
      },
    );
  }
}

}
