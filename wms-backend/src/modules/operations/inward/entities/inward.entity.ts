
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inward')
export class Inward {

  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  warehouseId !: string;

  @ManyToOne(()=> Warehouse)
  @JoinColumn({name: 'warehouseId'})
  warehouse!: Warehouse;

}
