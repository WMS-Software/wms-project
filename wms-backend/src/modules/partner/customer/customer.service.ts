import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from './entities/customer.entity';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateCustomerDto, userId: string) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { userId }, 
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const customerCode = await this.generateCustomerCode(warehouse);

    const customer = this.repo.create({
      ...dto,
      warehouseId: warehouse.id,
      customerCode,
    });

    try {
      return await this.repo.save(customer);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Customer already exists');
      }
      throw error;
    }
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { userId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const query = this.repo
      .createQueryBuilder('customer')
      .where('customer.warehouseId = :warehouseId', {
        warehouseId: warehouse.id,
      })
      .andWhere('customer.status = :status', { status: 'ACTIVE' });

    if (search) {
      query.andWhere(
        '(customer.name ILIKE :search OR customer.customerCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('customer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { userId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const customer = await this.repo.findOne({
      where: {
        id,
        warehouseId: warehouse.id, // 🔥 prevent cross-access
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, dto: Partial<CreateCustomerDto>, userId: string) {
    const customer = await this.findOne(id, userId);

    Object.assign(customer, dto);

    return this.repo.save(customer);
  }

  async remove(id: string, userId: string) {
    const customer = await this.findOne(id, userId);

    customer.status = 'INACTIVE';

    return this.repo.save(customer);
  }
  
  private async generateCustomerCode(
    warehouse: Warehouse,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const whCode = warehouse.warehouseCode.split('-')[1];

    const count = await this.repo.count({
      where: { warehouseId: warehouse.id },
    });

    const sequence = (count + 1).toString().padStart(4, '0');

    return `CUST-${whCode}-${year}-${sequence}`;
  }
}