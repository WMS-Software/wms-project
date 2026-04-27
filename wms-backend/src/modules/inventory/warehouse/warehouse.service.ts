import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateWarehouseDto } from './dto/wareHouse.dto';
import { Warehouse } from './entities/warehouse.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { formatWarehouseCode } from './utils/formatCode.utils';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  // 🔥 CREATE WAREHOUSE (FIXED)
  async createWarehouse(
    dto: CreateWarehouseDto,
    userId: string,
  ): Promise<Warehouse> {
    try {
      // ✅ get last sequence
      const last = await this.warehouseRepo.find({
        order: { sequenceNumber: 'DESC' },
        take: 1,
      });

      const nextSequence = last.length
        ? last[0].sequenceNumber + 1
        : 1;

      // ✅ generate code before saving so required unique field is present
      const warehouseCode = formatWarehouseCode(
        dto.city,
        dto.pincode,
        nextSequence,
      );

      // ✅ create warehouse
      const warehouse = this.warehouseRepo.create({
        ...dto,
        userId,
        sequenceNumber: nextSequence,
        warehouseCode,
      });

      return await this.warehouseRepo.save(warehouse);

    } catch (error: any) {
      console.error('Error in creating warehouse:', error);
      throw new InternalServerErrorException('Failed to create warehouse');
    }
  }

  // 🔥 GET ALL
  async findAllWarehouse() {
    return this.warehouseRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // 🔥 GET ONE
  async findWarehouseById(id: string) {
    const warehouse = await this.warehouseRepo.findOneBy({ id });

    if (!warehouse || !warehouse.isActive) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  // 🔥 UPDATE
  async updateWarehouse(id: string, dto: Partial<CreateWarehouseDto>) {
    try {
      const warehouse = await this.findWarehouseById(id);

      Object.assign(warehouse, dto);

      return await this.warehouseRepo.save(warehouse);

    } catch (error: any) {
      console.error('Error updating warehouse:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update warehouse');
    }
  }

  // 🔥 SOFT DELETE
  async deleteWarehouse(id: string) {
    const warehouse = await this.findWarehouseById(id);

    warehouse.isActive = false;

    await this.warehouseRepo.save(warehouse);

    return { message: 'Warehouse deactivated successfully' };
  }
}