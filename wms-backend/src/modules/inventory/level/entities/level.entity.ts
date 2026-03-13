
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('level')
export class Level {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  levelNumber !: number;

  @Column()
  warehouseId!: string;

  @ManyToOne(()=> Warehouse)
  @JoinColumn({name: 'warehouseId'})
  warehouse!: Warehouse;

  @CreateDateColumn()
    createdAt!: Date;
  
  @UpdateDateColumn()
    updatedAt!: Date;
}
