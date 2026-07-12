import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DispatchSession } from '../dispatch-session/entities/dispatchSession.entity';
import { outwardStatus } from '../dispatch-session/entities/outward_Status.enum';
import { OutwardTransaction } from './entities/outward-transaction.entity';
import { DispatchScan } from '../dispatch-session/entities/dispatch_scans.entity';
import { CreateOutwardTransactionDto } from './dto/create-outward-transaction.dto';
import { OutwardTransactionSession } from '../outward-transaction-session/entities/outward-transaction-session.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { OutwardItem } from '../outward-item/entities/outward-item.entity';

@Injectable()
export class OutwardTransactionService {
  constructor(private dataSource: DataSource) {}

  private async getDispatchSessions(
    manager: EntityManager,
    dispatchSessionIds: string[],
  ) {
    const dispatchSessions = await manager.find(DispatchSession, {
      where: dispatchSessionIds.map((id) => ({
        id,
      })),
    });

    if (dispatchSessions.length !== dispatchSessionIds.length) {
      throw new NotFoundException(
        'One or more dispatch sessions were not found.',
      );
    }

    return dispatchSessions;
  }

  private async getDispatchScans(
    manager: EntityManager,
    dispatchSessionIds: string[],
  ) {
    const dispatchScans = await manager.find(DispatchScan, {
      where: dispatchSessionIds.map((dispatchSessionId) => ({
        dispatchSessionId,
      })),
    });

    return dispatchScans;
  }

  // ⭐ 7 ADD HERE
private async getBagsByIds(
  manager: EntityManager,
  bagIds: string[],
) {
  const bags = await manager.find(Bag, {
    where: bagIds.map((id) => ({
      id,
    })),
  });

  if (bags.length !== bagIds.length) {
    throw new NotFoundException(
      'One or more bags were not found.',
    );
  }

  return bags;
}

  private ensureAllDispatchSessionsCompleted(
    dispatchSessions: DispatchSession[],
  ) {
    for (const session of dispatchSessions) {
      if (session.status !== outwardStatus.completed) {
        throw new BadRequestException(
          `Dispatch session ${session.id} is not completed.`,
        );
      }
    }
  }

  private ensureSameCustomer(dispatchSessions: DispatchSession[]) {
    const customerId = dispatchSessions[0].customerId;

    for (const session of dispatchSessions) {
      if (session.customerId !== customerId) {
        throw new BadRequestException(
          'All dispatch sessions must belong to the same customer.',
        );
      }
    }
  }

  private ensureSameWarehouse(dispatchSessions: DispatchSession[]) {
    const warehouseId = dispatchSessions[0].warehouseId;

    for (const session of dispatchSessions) {
      if (session.warehouseId !== warehouseId) {
        throw new BadRequestException(
          'All dispatch sessions must belong to the same warehouse.',
        );
      }
    }
  }

  private async ensureDispatchSessionsNotAlreadyUsed(
    manager: EntityManager,
    dispatchSessionIds: string[],
  ) {
    const existingMappings = await manager.find(OutwardTransactionSession, {
      where: dispatchSessionIds.map((dispatchSessionId) => ({
        dispatchSessionId,
      })),
    });

    if (existingMappings.length > 0) {
      throw new BadRequestException(
        'One or more dispatch sessions are already linked to an outward transaction.',
      );
    }
  }

  //   private async ensureOutwardTransactionNotExists(manager: EntityManager, dispatchSessionId: string ) {
  //     const outwardTransaction = await manager.findOne(OutwardTransaction, {
  //       where: { dispatchSessionId },
  //     });

  //     if (outwardTransaction) {
  //       throw new BadRequestException(
  //         'Outward transaction already exists for this dispatch session.',
  //       );
  //     }
  //   }

private async generateOutwardNumber(
  manager: EntityManager,
): Promise<string> {

  const lastTransaction = await manager
    .getRepository(OutwardTransaction)
    .createQueryBuilder('outward')
    .orderBy('outward.createdAt', 'DESC')
    .getOne();

  let nextSequence = 1;

  if (lastTransaction) {
    const lastNumber = Number(
      lastTransaction.outwardNumber.replace('OUT-', ''),
    );

    nextSequence = lastNumber + 1;
  }

  return `OUT-${String(nextSequence).padStart(6, '0')}`;
}

  private async createOutwardItems(
    manager: EntityManager,
    outwardTransaction: OutwardTransaction,
    dispatchSessionIds: string[],
  ) {
    // 1. Get Dispatch Scans
    const dispatchScans = await this.getDispatchScans(
      manager,
      dispatchSessionIds,
    );

    // 2. Get Bags
    const bags = await this.getBagsByIds(
      manager,
      dispatchScans.map((scan) => scan.bagId),
    );

    // 3. Convert Bags to Map
    const bagMap = new Map(bags.map((bag) => [bag.id, bag]));

    // 4. Create Outward Items
    const outwardItems = dispatchScans.map((scan) => {
      const bag = bagMap.get(scan.bagId);

      if (!bag) {
        throw new NotFoundException(`Bag ${scan.bagId} not found.`);
      }

      return manager.getRepository(OutwardItem).create({
        outwardTransactionId: outwardTransaction.id,

        bagId: bag.id,

        barcode: bag.barcode,

        lotId: bag.lotId,

        rackId: bag.rackId,
      });
    });

    // 5. Save
    await manager.getRepository(OutwardItem).save(outwardItems);
  }

  async createOutwardTransaction(dto: CreateOutwardTransactionDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Get Dispatch Sessions
      const dispatchSessions = await this.getDispatchSessions(
        manager,
        dto.dispatchSessionIds,
      );

      // 2. Business Validations
      this.ensureAllDispatchSessionsCompleted(dispatchSessions);

      this.ensureSameCustomer(dispatchSessions);

      this.ensureSameWarehouse(dispatchSessions);

      await this.ensureDispatchSessionsNotAlreadyUsed(
        manager,
        dto.dispatchSessionIds,
      );

      // 3. Calculate Summary
      const totalBags = dispatchSessions.reduce(
        (total, session) => total + session.dispatchedBags,
        0,
      );

      // For now
      const totalQuantity = totalBags;

      // 4. Generate Number
      const outwardNumber = await this.generateOutwardNumber(manager);

      // 5. Create Transaction
      const outwardTransaction = manager
        .getRepository(OutwardTransaction)
        .create({
          outwardNumber,

          customerId: dispatchSessions[0].customerId,

          warehouseId: dispatchSessions[0].warehouseId,

          totalBags,

          totalQuantity,

          remarks: dto.remarks,
        });

      // 6. Save
      await manager.getRepository(OutwardTransaction).save(outwardTransaction);

      // 7. Create Dispatch Session Mapping
      const outwardTransactionSessions = dispatchSessions.map((session) =>
        manager.getRepository(OutwardTransactionSession).create({
          outwardTransactionId: outwardTransaction.id,

          dispatchSessionId: session.id,
        }),
      );

      // 8. Save Mapping
      await manager
        .getRepository(OutwardTransactionSession)
        .save(outwardTransactionSessions);

      // 9. Create Outward Items
      await this.createOutwardItems(
        manager,
        outwardTransaction,
        dto.dispatchSessionIds,
      );

      return outwardTransaction;
    });
  }
}
