
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('level')
@Unique(['warehouseId', 'levelNumber'])
export class Level {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  levelNumber !: number;

  @Column()
  warehouseId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(()=> Warehouse)
  @JoinColumn({name: 'warehouseId'})
  warehouse!: Warehouse;

  @CreateDateColumn()
    createdAt!: Date;
  
  @UpdateDateColumn()
    updatedAt!: Date;
}
