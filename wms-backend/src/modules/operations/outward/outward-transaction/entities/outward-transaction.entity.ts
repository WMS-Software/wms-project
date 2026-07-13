import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DispatchSession } from '../../dispatch-session/entities/dispatchSession.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { OutwardTransactionStatus } from './outward-transaction-status.enum';

@Entity('outwar_transaction')
export class OutwardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column()
  // lotId!: string;

  @Column({ unique: true })
  outwardNumber!: string;

  // @Column({ unique: true })
  // dispatchSessionId!: string;

  // @OneToOne(() => DispatchSession, { nullable: false })
  // @JoinColumn({ name: 'dispatchSessionId' })
  // dispatchSession!: DispatchSession;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column()
  warehouseId!: string;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  @Column({
    type: 'enum',
    enum: OutwardTransactionStatus,
    default: OutwardTransactionStatus.confirmed,
  })
  status!: OutwardTransactionStatus;

  @Column({ type: 'int' })
  totalBags!: number;

  @Column({ type: 'int'})
  totalQuantity!: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  //   @OneToMany(
  //     () => OutwardItem,
  //     (outwardItem) => outwardItem.outwardTransaction,
  //     {
  //       cascade: false,
  //     },
  //   )
  //   items!: OutwardItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
