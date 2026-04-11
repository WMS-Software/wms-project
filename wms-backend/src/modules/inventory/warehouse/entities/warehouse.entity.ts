import { User } from 'src/modules/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
console.log("WAREHOUSE ENTITY LOADED");
@Entity('warehouses')
export class Warehouse {


  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  warehouseCode!: string;

  @Column()
  warehouseName!: string;

  @Column()
  address!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'int', generated: 'increment', unique: true })
  sequenceNumber!: number;

  @Column({
    type: 'enum',
    enum: ['EMPTY', 'PARTIALLY_FULL', 'FULL'],
    default: 'EMPTY',
  })
  status!: string;

  @Column()
  userId!: string;

  //user bannene k baad un comment krna hai
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'userId' })
  // user!: User;

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