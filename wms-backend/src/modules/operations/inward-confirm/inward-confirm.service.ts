import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfirmPutawayDto } from './dto/inward-confirm.dto';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inward } from '../inward/entities/inward.entity';
import { Rack } from 'src/modules/inventory/rack/entities/rack.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';
import { BagStatus } from 'src/modules/inventory/bag/entities/bag_status.enum';
import { RackStatus } from 'src/modules/inventory/rack/entities/rack_status.enum';
import { LotLocationService } from 'src/modules/inventory/lot-location/lot-location.service';

@Injectable()
export class InwardConfirmService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Inward)
    private inwardRepo: Repository<Inward>,

    @InjectRepository(Bag)
    private bagRepo: Repository<Bag>,

    @InjectRepository(Rack)
    private rackRepo: Repository<Rack>,

    private lotLocationService: LotLocationService,
  ) {}

  private async getInward(manager: any, inwardId: string) {
    const inward = await manager.getRepository(Inward).findOne({
      where: { id: inwardId },
    });

    if (!inward) {
      throw new NotFoundException('Inward not found');
    }

    return inward;
  }

  private async getStoredBags(manager: any, lotId: string) {
    const bags = await manager.getRepository(Bag).find({
      where: {
        lotId: lotId,
        status: BagStatus.stored,
      },
      select: ['id', 'rackId', 'scannedAt'],
    });

    if (bags.length === 0) {
      throw new BadRequestException('No stored bags found for this inward');
    }

    return bags;
  }

  private async resyncRackCounts(
    manager: any,
    lotId: string,
    rackIds: Set<string>,
  ) {
    for (const rackId of rackIds) {
      const count = await manager.getRepository(Bag).count({
        where: {
          rackId,
          lotId,
          status: BagStatus.stored,
        },
      });

      await manager
        .getRepository(Rack)
        .update({ id: rackId }, { currentBags: count });
    }
  }

  // this function count bags in rack after temp allotment
  private buildCurrentMap(bags: Bag[]) {
    const map = new Map<string, number>();

    for (const bag of bags) {
      const rackId = bag.rackId!; // with ! symbol i guarntee it is not null
      map.set(rackId, (map.get(rackId) || 0) + 1);
    }

    return map;
  }

  private buildTargetMap(dto: ConfirmPutawayDto): Map<string, number> {
    const map = new Map<string, number>();

    for (const adj of dto.adjustments) {
      // duplicate rack check
      if (map.has(adj.rackId)) {
        throw new BadRequestException('Duplicate rack in adjustment');
      }

      // negative qty check
      if (adj.actualQty < 0) {
        throw new BadRequestException('Quantity cannot be negative');
      }

      map.set(adj.rackId, adj.actualQty);
    }

    return map;
  }

  // find adjustment in each rack
  private calculateDiff(
    current: Map<string, number>,
    target: Map<string, number>,
  ): Map<string, number> {
    const diff = new Map<string, number>();

    // combine all rackIds
    const allRacks = new Set([...current.keys(), ...target.keys()]);

    for (const rackId of allRacks) {
      const c = current.get(rackId) || 0;
      const t = target.get(rackId) || 0;

      diff.set(rackId, t - c);
    }

    return diff;
  }

  private async moveBags(
    manager: any,
    lotId: string,
    donors: { rackId: string; qty: number }[],
    receivers: { rackId: string; qty: number }[],
  ) {
    const rackMap = new Map<string, Rack>();

    const getRack = async (rackId: string) => {
      if (!rackMap.has(rackId)) {
        const rack = await manager.getRepository(Rack).findOne({
          where: { id: rackId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!rack) {
          throw new BadRequestException(`Rack not found: ${rackId}`);
        }

        rackMap.set(rackId, rack);
      }

      return rackMap.get(rackId)!;
    };

    // simple pointer over receiver
    let rIdx = 0;

    for (const donor of donors) {
      if (donor.qty === 0) continue;

      // fetch all needed from this donor
      const donorBags = await manager.getRepository(Bag).find({
        where: {
          rackId: donor.rackId,
          lotId,
          status: BagStatus.stored,
        },
        order: { scannedAt: 'DESC' }, // follow LIFO
        take: donor.qty, // only what we need
        lock: { mode: 'pessimistic_write' },
      });

      if (donorBags.length !== donor.qty) {
        throw new BadRequestException(`Not enough bags in ${donor.rackId}`);
      }

      const donorRack = await getRack(donor.rackId);

      // distribute these bags to receivers

      let i = 0;

      while (i < donorBags.length && rIdx < receivers.length) {
        const receiver = receivers[rIdx];

        if (receiver.qty === 0) {
          rIdx++;
          continue;
        }

        const receiverRack = await getRack(receiver.rackId);

        const moveQty = Math.min(receiver.qty, donorBags.length - i);
        const slice = donorBags.slice(i, i + moveQty);

        for (const bag of slice) {
          bag.rackId = receiver.rackId;
        }

        // if (donorRack.currentBags < moveQty) {
        //   throw new BadRequestException(
        //     `Invalid donor rack count for ${donor.rackId}`,
        //   );
        // }

        // donorRack.currentBags -= moveQty;
        // receiverRack.currentBags += moveQty;

        // if (donorRack.currentBags === 0) {
        //   donorRack.status = RackStatus.empty;
        // }

        await manager.save(slice);

        // update lot mapping
        await this.lotLocationService.removeLotFromRack(
          manager,
          lotId,
          donorRack.id,
          moveQty,
        );

        await this.lotLocationService.commitLotDistribution(
          manager,
          lotId,
          receiverRack.id,
          moveQty,
        );

        // update rack mapping
        await this.lotLocationService.syncRackOccupancy(
          manager,
          new Set([donorRack.id]),
        );
        await this.lotLocationService.syncRackOccupancy(
          manager,
          new Set([receiverRack.id]),
        );

        receiver.qty -= moveQty;
        i += moveQty;
      }

      if (i !== donorBags.length) {
        throw new BadRequestException('Unassigned donor bags remain');
      }
    }

    // await manager.save(Array.from(rackMap.values()));

    const remaining = receivers.reduce((s, r) => s + r.qty, 0);
    if (remaining !== 0) {
      throw new BadRequestException('Not enough supply to satisfy receivers');
    }
  }

  async preview(inwardId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const inward = await this.getInward(manager, inwardId);

      if (!inward.lotId) {
        throw new BadRequestException('Lot not linked to inward');
      }

      const bags = await this.getStoredBags(manager, inward.lotId);

      const currentMap = this.buildCurrentMap(bags);

      return {
        totalBags: bags.length,
        rackDistribution: Object.fromEntries(currentMap),
      };
    });
  }

  async confirmPutaway(inwardId: string, dto: ConfirmPutawayDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        console.log(dto);
        // it check is adjusment needed ?
        const hasAdjustments = dto.adjustments && dto.adjustments.length > 0;

        const inward = await this.getInward(manager, inwardId);
        if (inward.isConfirmed) {
          throw new BadRequestException('Inward already confirmed');
        }

        if (!inward.lotId) {
          throw new BadRequestException('Lot not linked to inward');
        }

        const lotId = inward.lotId;

        // fetching all the bags of inward lot
        const bags = await this.getStoredBags(manager, lotId);

        // checking every bag must have rackId
        for (const bag of bags) {
          if (!bag.rackId) {
            throw new BadRequestException('Bag without rack found');
          }
        }

        const currentMap = this.buildCurrentMap(bags);
        console.log('Current', Object.fromEntries(currentMap));

        for (const [rackId, qty] of currentMap) {

   await this.lotLocationService.upsertLotDistribution(
      manager,
      lotId,
      rackId,
      qty,
   );
}

        // if no adjustment needed its isconfirmed = true
        if (!hasAdjustments) {
          // 🔥 Just confirm current state as final truth

          const rackIds = new Set(currentMap.keys());

          for (const [rackId, qty] of currentMap) {
            await this.lotLocationService.upsertLotDistribution(
              manager,
              lotId,
              rackId,
              qty,
            );
          }

          await this.resyncRackCounts(manager, lotId, rackIds);
          inward.isConfirmed = true;
          await manager.save(inward);

          return {
            message: 'Confirmed as-is (no adjustment applied)',
          };
        }

        const targetMap = this.buildTargetMap(dto);
        console.log('Target:', Object.fromEntries(targetMap));

        console.log('Target:', Object.fromEntries(targetMap));

        // validate total bags

        const totalCurrent = bags.length;

        const totalTarget = dto.adjustments.reduce(
          (sum, a) => sum + a.actualQty,
          0,
        );

        if (totalCurrent !== totalTarget) {
          throw new BadRequestException('Total quantity mismatch');
        }

        const diffMap = this.calculateDiff(currentMap, targetMap);
        console.log('Difference', Object.fromEntries(diffMap));

        const hasMovement = Array.from(diffMap.values()).some((v) => v !== 0);

        if (!hasMovement) {
          const allRacks = new Set([...currentMap.keys(), ...targetMap.keys()]);

          for (const [rackId, qty] of targetMap) {
            await this.lotLocationService.upsertLotDistribution(
              manager,
              lotId,
              rackId,
              qty,
            );
          }

          await this.resyncRackCounts(manager, lotId, allRacks);

          inward.isConfirmed = true;
          await manager.save(inward);

          return {
            message: 'No movement required, confirmed successfully',
          };
        }

        // seprate donar rack and receiver rack

        const donors: { rackId: string; qty: number }[] = [];
        const receivers: { rackId: string; qty: number }[] = [];

        for (const [rackId, value] of diffMap) {
          if (value < 0) {
            donors.push({ rackId, qty: Math.abs(value) });
          } else if (value > 0) {
            receivers.push({ rackId, qty: value });
          }
        }

        console.log('Donors', donors);
        console.log('Receiver', receivers);

        await this.moveBags(manager, lotId, donors, receivers);

        const allRacks = new Set([...currentMap.keys(), ...targetMap.keys()]);

        await this.resyncRackCounts(manager, lotId, allRacks);

        inward.isConfirmed = true;
        await manager.save(inward);

        return {
          message: 'Putaway confirmed successfully',
        };
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}
