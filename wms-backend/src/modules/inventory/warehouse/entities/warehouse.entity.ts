import { User } from 'src/modules/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({
    type: 'enum',
    enum: ['EMPTY', 'PARTIALLY_FULL', 'FULL'],
    default: 'EMPTY',
  })
  status!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  pincode!: string;

  @Column({ default: 0 })
  numberOfBags!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
  
}