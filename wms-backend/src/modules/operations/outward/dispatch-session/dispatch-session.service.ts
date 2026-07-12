import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lot } from 'src/modules/inventory/lot/entities/lot.entity';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DispatchSession } from './entities/dispatchSession.entity';
import { DispatchSessionDto } from './dto/dispatchSession.dto';
import { outwardStatus } from './entities/outward_Status.enum';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { BagStatus } from 'src/modules/inventory/bag/entities/bag_status.enum';
import { ScanBagDto } from './dto/scan_bag.dto';
import { DispatchScan } from './entities/dispatch_scans.entity';
import { UnscanBagDto } from './dto/unscan_bag.dto';
import { In } from 'typeorm';
import { LotLocation } from 'src/modules/inventory/lot-location/entities/lot-location.entity';
import { Rack } from 'src/modules/inventory/rack/entities/rack.entity';
import { DispatchScanStatus } from './entities/dispatchScan_Status.enum';
import { RackStatus } from 'src/modules/inventory/rack/entities/rack_status.enum';

@Injectable()
export class DispatchSessionService {
  constructor(
    @InjectRepository(Lot)
    private lotRepo: Repository<Lot>,

    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(Bag)
    private bagRepo: Repository<Bag>,

    private dataSource: DataSource,
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
      where: {
        barcode,
      },
    });
    if (!bag) {
      throw new BadRequestException('Bag not found');
    }
    return bag;
  }

  private async getBagsByIds(manager: EntityManager, bagIds: string[]) {
    return manager.getRepository(Bag).find({
      where: {
        id: In(bagIds),
      },
    });
  }

  private async getLotLocation(
    manager: EntityManager,
    lotId: string,
    rackId: string,
  ) {
    const lotLocation = await manager.getRepository(LotLocation).findOne({
      where: {
        lotId,
        rackId,
      },
    });

    if (!lotLocation) {
      throw new NotFoundException(`LotLocation not found for rack ${rackId}`);
    }

    return lotLocation;
  }

  private async getRack(manager: EntityManager, rackId: string) {
    const rack = await manager.getRepository(Rack).findOne({
      where: {
        id: rackId,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    return rack;
  }

  private async getSession(manager: EntityManager, sessionId: string) {
    const session = await manager.getRepository(DispatchSession).findOne({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Dispatch Session Not found');
    return session;
  }

  private ensureSessionIsActive(session: DispatchSession) {
    if (session.status !== outwardStatus.active) {
      throw new BadRequestException('Dispatch session is not active');
    }
  }

  private async ensureQtyNotExceeded(
    manager: EntityManager,
    session: DispatchSession,
  ) {
    const scannedQty = await manager.getRepository(DispatchScan).count({
      where: {
        dispatchSessionId: session.id,
        status: DispatchScanStatus.active,
      },
    });
    if (scannedQty >= session.requiredQty) {
      throw new BadRequestException('Required quantity already scanned');
    }
  }

  private async ensureNoActiveSessionForLot(
    manager: EntityManager,
    lotId: string,
  ) {
    const session = await manager.getRepository(DispatchSession).findOne({
      where: {
        lotId,
        status: outwardStatus.active,
      },
    });

    if (session) {
      throw new BadRequestException(
        'Active dispatch session already exists for this lot',
      );
    }
    return session;
  }

  private async ensureBagCanBeDispatched(bag: Bag, session: DispatchSession) {
    if (bag.lotId !== session.lotId) {
      throw new BadRequestException(
        'Bag does not belong to dispatch session lot',
      );
    }
    if (bag.status !== BagStatus.stored) {
      throw new BadRequestException('Bag is not available for dispatch');
    }
  }

  private async reserveBagForDispatch(manager: EntityManager, bag: Bag) {
    bag.status = BagStatus.locked;

    await manager.getRepository(Bag).save(bag);
  }

  private async releaseBagReservation(manager: EntityManager, bag: Bag) {
    bag.status = BagStatus.stored;
    await manager.getRepository(Bag).save(bag);
  }

  private async ensureDuplicateScan(
    manager: EntityManager,
    bag: Bag,
    session: DispatchSession,
  ) {
    const existing = await manager.getRepository(DispatchScan).findOne({
      where: {
        dispatchSessionId: session.id,
        bagId: bag.id,
        status: DispatchScanStatus.active,
      },
    });
    if (existing) {
      throw new BadRequestException('Bag already scanned');
    }
  }

  // return one scan detail of dispatch session
  private async getDispatchScan(
    manager: EntityManager,
    dispatchSessionId: string,
    bagId: string,
  ) {
    const dispatchScan = await manager.getRepository(DispatchScan).findOne({
      where: {
        dispatchSessionId,
        bagId,
        status: DispatchScanStatus.active,
      },
    });

    if (!dispatchScan) {
      throw new NotFoundException('Dispatch scan not found');
    }

    return dispatchScan;
  }

  // return all bags of dispatch session
  private async getAllDispatchScans(
    manager: EntityManager,
    dispatchSessionId: string,
  ) {
    const dispatchScans = await manager.getRepository(DispatchScan).find({
      where: {
        dispatchSessionId,
      },
      order: {
        scannedAt: 'ASC',
      },
    });

    return dispatchScans;
  }

  private async getActiveDispatchScans(
    manager: EntityManager,
    dispatchSessionId: string,
  ) {
    const dispatchScans = await manager.getRepository(DispatchScan).find({
      where: {
        dispatchSessionId,
        status: DispatchScanStatus.active,
      },
      order: {
        scannedAt: 'ASC',
      },
    });

    return dispatchScans;
  }

  private ensureDispatchReady(session: DispatchSession, scannedQty: number) {
    if (scannedQty === 0) {
      throw new BadRequestException('No bags scanned for dispatch.');
    }

    if (scannedQty !== session.requiredQty) {
      throw new BadRequestException(
        `Expected ${session.requiredQty} bags but found ${scannedQty}.`,
      );
    }
  }

  private async updateSessionStatus(
    manager: EntityManager,
    session: DispatchSession,
    status: outwardStatus,
  ) {
    session.status = status;

    return manager.getRepository(DispatchSession).save(session);
  }

  private async getDispatchBags(
    manager: EntityManager,
    dispatchSessionId: string,
  ) {
    const dispatchScans = await this.getActiveDispatchScans(
      manager,
      dispatchSessionId,
    );

    const bagIds = dispatchScans.map((scan) => scan.bagId);

    if (bagIds.length === 0) {
      return [];
    }

    const bags = await manager.getRepository(Bag).find({
      where: {
        id: In(bagIds),
      },
    });

    if (bags.length !== bagIds.length) {
      throw new NotFoundException('One or more scanned bags were not found.');
    }

    return bags;
  }

  private groupBagsByRack(bags: Bag[]) {
    const rackMap = new Map<string, Bag[]>();

    for (const bag of bags) {
      if (!bag.rackId) {
        throw new BadRequestException(
          `Bag ${bag.barcode} is not assigned to any rack.`,
        );
      }

      const rackBags = rackMap.get(bag.rackId) ?? [];

      rackBags.push(bag);

      rackMap.set(bag.rackId, rackBags);
    }

    return rackMap;
  }

  private async markBagAsDispatched(manager: EntityManager, bag: Bag) {
    bag.status = BagStatus.dispatched;
    bag.dispatchedAt = new Date();
    bag.rackId = null;

    await manager.getRepository(Bag).save(bag);
  }

  private async updateDispatchScanStatus(
    manager: EntityManager,
    dispatchScans: DispatchScan[],
    status: DispatchScanStatus,
  ) {
    for (const scan of dispatchScans) {
      scan.status = status;
    }

    await manager.getRepository(DispatchScan).save(dispatchScans);
  }

  async createDispatchSession(dto: DispatchSessionDto) {
    return await this.dataSource.transaction(async (manager) => {
      const lot = await this.getLot(manager, dto.lotId);
      const warehouse = await this.getWarehouse(manager, dto.warehouseId);
      const customer = await this.getCustomer(manager, dto.customerId);

      // check for active session for lot

      await this.ensureNoActiveSessionForLot(manager, dto.lotId);

      // create Session

      const session = manager.getRepository(DispatchSession).create({
        lotId: lot.id,
        warehouseId: warehouse.id,
        customerId: customer.id,
        requiredQty: dto.requiredQty,

        status: outwardStatus.active,
      });

      return manager.getRepository(DispatchSession).save(session);
    });
  }

  async scanBag(sessionId: string, dto: ScanBagDto) {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.getSession(manager, sessionId);
      const bag = await this.getBag(manager, dto.barcode);
      await this.ensureSessionIsActive(session);
      await this.ensureQtyNotExceeded(manager, session);
      await this.ensureBagCanBeDispatched(bag, session);
      await this.ensureDuplicateScan(manager, bag, session);

      const scan = manager.getRepository(DispatchScan).create({
        dispatchSessionId: session.id,
        bagId: bag.id,
        barcode: bag.barcode,
        scannedAt: new Date(),
        status: DispatchScanStatus.active,
      });

      await manager.getRepository(DispatchScan).save(scan);

      await this.reserveBagForDispatch(manager, bag);

      const scannedQty = await manager.getRepository(DispatchScan).count({
        where: {
          dispatchSessionId: session.id,
          status: DispatchScanStatus.active,
        },
      });

      return {
        sessionId: session.id,
        scannedQty,
        requiredQty: session.requiredQty,
        remainingQty: session.requiredQty - scannedQty,
      };
    });
  }

  async unscanBag(sessionId: string, dto: UnscanBagDto) {
    return this.dataSource.transaction(async (manager) => {
      // Step 1
      const session = await this.getSession(manager, sessionId);

      // Step 2
      this.ensureSessionIsActive(session);

      // Step 3
      const bag = await this.getBag(manager, dto.barcode);

      // Step 4
      const dispatchScan = await this.getDispatchScan(
        manager,
        session.id,
        bag.id,
      );

      dispatchScan.status = DispatchScanStatus.cancelled;
      // Step 5
      await manager.getRepository(DispatchScan).save(dispatchScan);

      // Step 6
      await this.releaseBagReservation(manager, bag);

      // Step 7
      const scannedQty = await manager.getRepository(DispatchScan).count({
        where: {
          dispatchSessionId: session.id,
          status: DispatchScanStatus.active,
        },
      });

      // Step 8
      return {
        sessionId: session.id,
        scannedQty,
        requiredQty: session.requiredQty,
        remainingQty: session.requiredQty - scannedQty,
      };
    });
  }

  async getSessionDetails(sessionId: string) {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.getSession(manager, sessionId);

      const dispatchScans = await this.getAllDispatchScans(manager, session.id);
      const activeScans = dispatchScans.filter(
        (scan) => scan.status === DispatchScanStatus.active,
      );
      const cancelledScans = dispatchScans.filter(
        (scan) => scan.status === DispatchScanStatus.cancelled,
      );
      const scannedQty = dispatchScans.length;

      return {
        sessionId: session.id,
        warehouseId: session.warehouseId,
        customerId: session.customerId,
        lotId: session.lotId,

        status: session.status,

        requiredQty: session.requiredQty,

        scannedQty: activeScans.length,
        cancelledQty: cancelledScans.length,

        remainingQty: session.requiredQty - activeScans.length,

        scannedBags: dispatchScans,
      };
    });
  }

  async cancelDispatchSession(sessionId: string) {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.getSession(manager, sessionId);

      this.ensureSessionIsActive(session);

      const scans = await this.getActiveDispatchScans(manager, session.id);

      const bagIds = scans.map((scan) => scan.bagId);

      const bags = await this.getBagsByIds(manager, bagIds);

      for (const bag of bags) {
        await this.releaseBagReservation(manager, bag);
      }

      await this.updateDispatchScanStatus(
        manager,
        scans,
        DispatchScanStatus.cancelled,
      );

      await this.updateSessionStatus(manager, session, outwardStatus.cancelled);

      return {
        message: 'Dispatch session cancelled successfully.',
      };
    });
  }

  async confirmDispatch(sessionId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Get Session
      const session = await this.getSession(manager, sessionId);

      this.ensureSessionIsActive(session);

      // 2. Get Dispatch Scans
      const dispatchScans = await this.getActiveDispatchScans(
        manager,
        session.id,
      );

      this.ensureDispatchReady(session, dispatchScans.length);

      // 3. Get Bags
      const bags = await this.getDispatchBags(manager, session.id);

      // 4. Group by Rack
      const rackMap = this.groupBagsByRack(bags);

      // 5. Update Rack & LotLocation
      for (const [rackId, rackBags] of rackMap) {
        const rack = await this.getRack(manager, rackId);

        const lotLocation = await this.getLotLocation(
          manager,
          session.lotId,
          rackId,
        );

        rack.currentBags -= rackBags.length;

        if (rack.currentBags < 0) {
          throw new BadRequestException('Rack bag count cannot be negative.');
        }

        if (rack.currentBags === 0) {
          rack.isBusy = false;
          rack.status = RackStatus.available;
        }

        lotLocation.quantity -= rackBags.length;

        if (lotLocation.quantity < 0) {
          throw new BadRequestException(
            'Lot location quantity cannot be negative.',
          );
        }

        await manager.getRepository(Rack).save(rack);

        if (lotLocation.quantity === 0) {
          await manager.getRepository(LotLocation).remove(lotLocation);
        } else {
          await manager.getRepository(LotLocation).save(lotLocation);
        }
      }

      // 6. Update Lot
      const lot = await this.getLot(manager, session.lotId);

      lot.availableQuantity -= bags.length;

      if (lot.availableQuantity < 0) {
        throw new BadRequestException('Lot quantity cannot be negative.');
      }

      await manager.getRepository(Lot).save(lot);

      // 7. Update Bags
      for (const bag of bags) {
        await this.markBagAsDispatched(manager, bag);
      }

      // 8. Save Dispatch Summary
      session.dispatchedBags = bags.length;
      session.completedAt = new Date();

      // 9. Complete Session
      await this.updateSessionStatus(manager, session, outwardStatus.completed);

      return {
        message: 'Dispatch completed successfully.',
        dispatchedQty: bags.length,
      };
    });
  }
}
