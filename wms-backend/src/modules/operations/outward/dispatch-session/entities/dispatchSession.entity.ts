import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { outwardStatus } from './outward_Status.enum';

@Entity('dispatch_sessions')
export class DispatchSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  warehouseId!: string;

  @Column()
  lotId!: string;

  @Column()
  customerId!: string;

  @Column('int')
  requiredQty!: number;

  @Column({
    type: 'enum',
    enum: outwardStatus,
    default: outwardStatus.active,
  })
  status!: outwardStatus;

  @Column('int',{default: 0})
  scannedQty!: number

  @Column({ default: 0, }) 
  dispatchedBags!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt!: Date | null;


}
