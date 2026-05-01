import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InwardStatus } from './inward_status.enum';

@Entity('inward')
export class Inward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ type: 'timestamp' })
  date!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'enum',
    enum: InwardStatus,
    enumName: 'inward_status_enum',
    default: InwardStatus.created,
  })
  status!: InwardStatus;

  @Column()
  warehouseId!: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;
}
