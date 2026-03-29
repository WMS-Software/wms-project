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




  async createWarehouse(
    dto: CreateWarehouseDto,
    userId: string,
  ): Promise<Warehouse> {
    try {
      const warehouse = this.warehouseRepo.create({
        ...dto,
        userId,
      });
      const saveWarehouse = await this.warehouseRepo.save(warehouse);

      const warehouseCode = formatWarehouseCode(
        dto.city,
        dto.pincode,
        saveWarehouse.sequenceNumber,
      );

      saveWarehouse.warehouseCode = warehouseCode;
      return await this.warehouseRepo.save(saveWarehouse);
    } catch (error: any) {
      console.error('Error in creating warehouse', error.message);
      throw new InternalServerErrorException('Failed to create warehouse');
    }
  }




  async findAllWarehouse() {
    return this.warehouseRepo.find({
        where: {isActive: true}
    });
  }




  async findWarehouseById(id: string) {
    const warehouse = await this.warehouseRepo.findOneBy({ id });

    if (!warehouse || !warehouse.isActive) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }




  async updateWarehouse(id: string, dto: Partial<CreateWarehouseDto>) {
    try {
      const warehouse = await this.findWarehouseById(id);

      const { warehouseName } = dto;

      Object.assign(warehouse, { warehouseName });

      return await this.warehouseRepo.save(warehouse);

    } catch (error: any) {
      console.error('Error updating warehouse:', error.message);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update warehouse');
    }
  }




//   async deleteWarehouse(id: string) {
//     try {
//       await this.findWarehouseById(id);

//       await this.warehouseRepo.delete(id);

//       return { message: 'Deleted successfully' };
//     } catch (error: any) {
//       console.error('Error deleting warehouse:', error.message);

//       if (error instanceof NotFoundException) {
//         throw error;
//       }

//       throw new InternalServerErrorException('Failed to delete warehouse');
//     }
//   }

  async deleteWarehouse(id: string) {
      const warehouse = await this.findWarehouseById(id);

      warehouse.isActive = false;

     await this.warehouseRepo.save(warehouse);

     return { message: 'Warehouse deactivated successfully' };
  }

}
