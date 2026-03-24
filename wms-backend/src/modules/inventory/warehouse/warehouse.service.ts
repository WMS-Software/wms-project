
import { Injectable } from '@nestjs/common';
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
    async createWarehouse(dto: CreateWarehouseDto, userId: string): Promise<Warehouse>{

        const count = await this.warehouseRepo.count();

        const warehouseCode = formatWarehouseCode(
            dto.city, dto.pincode, count+1,
        );

        const warehouse = this.warehouseRepo.create({
            ...dto,
            warehouseCode,
            userId
        });

        return await this.warehouseRepo.save(warehouse);
    }

    async findWarehouseById(){}

    async updateWarehouse(){}

    async deleteWarehouse(){}
}
