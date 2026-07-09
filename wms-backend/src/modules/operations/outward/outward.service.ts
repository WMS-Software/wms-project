import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lot } from 'src/modules/inventory/lot/entities/lot.entity';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { DataSource, EntityManager, getManager, Repository } from 'typeorm';
import { DispatchSession } from './entities/dispatchSession.entity';
import { DispatchSessionDto } from './dto/dispatchSession.dto';
import { outwardStatus } from './entities/outward_Status.enum';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { BagStatus } from 'src/modules/inventory/bag/entities/bag_status.enum';
import { ScanBagDto } from './dto/scan_bag.dto';
import { Session } from 'inspector';
import { DispatchScan } from './entities/dispatch_scans.entity';

@Injectable()
export class OutwardService {
  constructor(
    @InjectRepository(Lot)
    private lotRepo: Repository<Lot>,

    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(Bag)
    private bagRepo : Repository<Bag>,

    private dataSource : DataSource,
  ) {}

  private async getLot(manager: EntityManager, lotId: string) {
    const lot = await manager.getRepository(Lot).findOne({
      where: { id: lotId },
    });

    if (!lot) throw new NotFoundException('Lot not found');
    return lot;
  }

  private async getWarehouse(manager: EntityManager, warehouseId: string) {
    const warehouse = await manager.getRepository(Warehouse).findOne({
      where: { id: warehouseId },
    });

    if (!warehouse) throw new NotFoundException('warehouse not found');
    return warehouse;
  }

  private async getCustomer(manager: EntityManager, customerId: string) {
    const customer = await manager.getRepository(Customer).findOne({
      where: { id: customerId },
    });

    if (!customer) throw new NotFoundException('customer not found');
    return customer;
  }

  private async getBag(manager: EntityManager, barcode: string) {
    const bag = await manager.getRepository(Bag).findOne({
      where : {
        barcode,
      }
    })
    if(!bag) {
      throw new BadRequestException('Bag not found');
    }
    return bag;
  }

  private async getSession(manager: EntityManager, sessionId: string) {
    const session = await manager.getRepository(DispatchSession).findOne({
        where: {id: sessionId},
    })
    if(!session) throw new NotFoundException('Dispatch Session Not found');
    return session;
  }

  private ensureSessionIsActive(
  session: DispatchSession,
) {
  if(session.status !== outwardStatus.active) {
    throw new BadRequestException(
      'Dispatch session is not active',
    );
  }
}

private async ensureQtyNotExceeded( manager: EntityManager,
  session: DispatchSession,
) {
   const scannedQty = await manager
    .getRepository(DispatchScan)
    .count({
      where: {
        dispatchSessionId: session.id,
      },
    });
  if(scannedQty >= session.requiredQty) {
    throw new BadRequestException(
      'Required quantity already scanned',
    );
  }
}

  private async ensureNoActiveSessionForLot(manager: EntityManager, lotId: string) {
    const session = await manager.getRepository(DispatchSession).findOne({
      where: {
        lotId,
        status : outwardStatus.active,
      },
      
    })

    if(session) {
      throw new BadRequestException('Active dispatch session already exists for this lot');
    }
    return session;
  }

  private async ensureBagCanBeDispatched(bag: Bag,session: DispatchSession) {
    if(bag.lotId !== session.lotId) {
      throw new BadRequestException('Bag does not belong to dispatch session lot');
    }
    if(bag.status !== BagStatus.stored) {
      throw new BadRequestException('Bag is not available for dispatch')
    }
  }

  private async reserveBagForDispatch(
  manager: EntityManager,
  bag: Bag,
) {
  bag.status = BagStatus.locked;

  await manager
    .getRepository(Bag)
    .save(bag);
}

private async releaseBagReservation(
  manager: EntityManager,
  bag: Bag,
) {
  bag.status = BagStatus.stored;
  await manager.getRepository(Bag).save(bag);
}

  private async ensureDuplicateScan(manager: EntityManager, bag: Bag, session: DispatchSession) {
    const existing = await manager
      .getRepository(DispatchScan)
      .findOne({
        where : {
          dispatchSessionId : session.id,
          bagId: bag.id
        }
      })
    if(existing) {
      throw new BadRequestException('Bag already scanned');
    }
    
  }

  async createDispatchSession(dto: DispatchSessionDto) {
      return await this.dataSource.transaction(async (manager) => {

      const lot = await this.getLot(manager,dto.lotId);
      const warehouse = await this.getWarehouse(manager,dto.warehouseId);
      const customer = await this.getCustomer(manager,dto.customerId);

      // check for active session for lot

      await this.ensureNoActiveSessionForLot(manager,dto.lotId);

      // create Session

      const session = manager
        .getRepository(DispatchSession)
        .create({
          lotId : lot.id,
          warehouseId : warehouse.id,
          customerId : customer.id,
          requiredQty : dto.requiredQty,
          scannedQty: 0,
          status: outwardStatus.active,
        });

        return manager.getRepository(DispatchSession).save(session);



    })
  }

  async scanBag(sessionId: string, dto: ScanBagDto) {
    return this.dataSource.transaction(async (manager)=> {
      const session = await this.getSession(manager, sessionId);
      const bag = await this.getBag(manager,dto.barcode);
      await this.ensureSessionIsActive(session);
      await this.ensureQtyNotExceeded(manager,session);
      await this.ensureBagCanBeDispatched(bag,session);
      await this.ensureDuplicateScan(manager,bag,session);

      const scan = manager
        .getRepository(DispatchScan)
        .create({
          dispatchSessionId: session.id,
          bagId:bag.id,
          barcode: bag.barcode,
          scannedAt: new Date(),
        });

        await manager.getRepository(DispatchScan).save(scan);

        await this.reserveBagForDispatch(manager,bag);

        const scannedQty = await manager
  .getRepository(DispatchScan)
  .count({
    where: {
      dispatchSessionId: session.id,
    },
  });

         return {
        sessionId: session.id,
        scannedQty,
        requiredQty:
          session.requiredQty,
        remainingQty:
          session.requiredQty - scannedQty,
      };
    })
  }

}
