
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Lot } from 'src/modules/inventory/lot/entities/lot.entity';

@Entity('customers')
@Unique(['warehouseId', 'customerCode'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerCode!: string;

  @Column()
  name!: string;

  @Column({ length: 15 })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column()
  warehouseId!: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => Lot, (lot) => lot.customer)
  lots!: Lot[];

  @Column({ default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
