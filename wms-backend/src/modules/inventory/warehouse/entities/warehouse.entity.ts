import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';

console.log("WAREHOUSE ENTITY LOADED");

// 🔥 enum for safety
export enum WarehouseStatus {
  EMPTY = 'EMPTY',
  PARTIALLY_FULL = 'PARTIALLY_FULL',
  FULL = 'FULL',
}

@Entity('warehouses')
export class Warehouse {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable:true })
  warehouseCode!: string;

  @Column()
  warehouseName!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ default: true })
  isActive!: boolean;

  // sequence per system (ok for now)
  @Column({ type: 'int',
    generated: 'increment',
   })
  sequenceNumber!: number;

  //  proper enum typing
  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.EMPTY,
  })
  status!: WarehouseStatus;

  // 🔥 index improves query speed
  @Index()
  @Column()
  userId!: string;

  // ✅ enable when needed
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  pincode!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}