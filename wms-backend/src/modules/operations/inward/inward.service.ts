import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { DataSource, Repository } from 'typeorm';
import { createInwardDto } from './dto/createInwardDto';
import { Inward } from './entities/inward.entity';
import { InwardStatus } from './entities/inward_status.enum';

@Injectable()
export class InwardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,

    @InjectRepository(Inward)
    private inwardRepo: Repository<Inward>,

    private dataSource: DataSource,
  ) {}

  private async getCustomer(manager: any, customerId: string) {
    const customer = await manager.getRepository(Customer).findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('customer not found');
    }
    return customer;
  }

  private async getWarehouse(manager: any, warehouseId: string) {
    const warehouse = await manager.getRepository(Warehouse).findOne({
      where: { id: warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('warehouse not found');
    }
    return warehouse;
  }

  private async getInward(manager: any, inwardId: string) {
    const inward = await manager.getRepository(Inward).findOne({
      where: { id: inwardId },
    });
    if (!inward) {
      throw new NotFoundException('inward not found');
    }
    return inward;
  }

  async createInward(dto: createInwardDto) {
    return await this.dataSource.transaction(async (manager) => {
      const customer = await this.getCustomer(manager, dto.customerId);
      const warehouse = await this.getWarehouse(manager, dto.warehouseId);

      const inward = manager.create(Inward, {
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        date: dto.date || new Date(),
        status: InwardStatus.created,
      });

      return await manager.save(inward);
    });
  }

  async getInwardById(inwardId: string) {
    const inward = await this.inwardRepo.findOne({
      where: { id: inwardId },
    });

    if (!inward) {
      throw new NotFoundException('Inward record not found');
    }

    return inward;
  }

  async inwardProgress(inwardId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const inward = await manager.getRepository(Inward).findOne({
        where: { id: inwardId },
      });

      if (!inward) {
        throw new NotFoundException('inward not found');
      }

      if (!inward.lotId) {
        throw new BadRequestException('Create lot before starting inward');
      }

      if (inward.status !== InwardStatus.created) {
        throw new BadRequestException('already in progress');
      }

      inward.status = InwardStatus.inProgress;

      await manager.save(inward);

      return inward;
    });
  }

  async completeInward(inwardId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const inward = await this.getInward(manager, inwardId);

      if (!inward.lotId) {
        throw new BadRequestException('Lot not linked to inward');
      }

      if (!inward.isConfirmed) {
        throw new BadRequestException(
          'Confirm putaway before completing inward',
        );
      }

      if (inward.status !== InwardStatus.inProgress) {
        throw new BadRequestException(
          'Inward must be in-progress to completed',
        );
      }

      inward.status = InwardStatus.completed;
      await manager.save(inward);
      return inward;
    });
  }
}
