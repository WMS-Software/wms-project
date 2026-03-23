import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Lot } from "../../lot/entities/lot.entity";
import { Rack } from "../../rack/entities/rack.entity";

@Entity('lot-locations')
@Unique(['lotId','rackId'])
export class LotLocation{

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  lotId!: string;

  @ManyToOne(()=> Lot)
  @JoinColumn({name: 'lotId'})
  lot!: Lot;

  @Column()
  rackId!: string;

  @ManyToOne(()=> Rack)
  @JoinColumn({name: 'rackId'})
  rack!: Rack;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}