import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';

import { OutwardTransaction } from '../../outward-transaction/entities/outward-transaction.entity';
import { Lot } from 'src/modules/inventory/lot/entities/lot.entity';
import { Rack } from 'src/modules/inventory/rack/entities/rack.entity';
import { Bag } from 'src/modules/inventory/bag/entities/bag.entity';

@Unique(['outwardTransactionId', 'bagId'])
@Entity('outward_items')
export class OutwardItem {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  outwardTransactionId!: string;

  @ManyToOne(() => OutwardTransaction, {
    nullable: false,
  })
  @JoinColumn({
    name: 'outwardTransactionId',
  })
  outwardTransaction!: OutwardTransaction;

  @Column()
  bagId!: string;

  @ManyToOne(() => Bag, {
    nullable: false,
  })
  @JoinColumn({
    name: 'bagId',
  })
  bag!: Bag;

  @Column()
  lotId!: string;

  @ManyToOne(() => Lot, {
    nullable: false,
  })
  @JoinColumn({
    name: 'lotId',
  })
  lot!: Lot;

  @Column({
    nullable: true,
  })
  rackId?: string | null;

  @ManyToOne(() => Rack, {
    nullable: true,
  })
  @JoinColumn({
    name: 'rackId',
  })
  rack?: Rack;

  @Column()
  barcode!: string;

  @CreateDateColumn()
  createdAt!: Date;
}