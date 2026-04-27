
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Inward } from 'src/modules/operations/inward/entities/inward.entity';
import { Outward } from 'src/modules/operations/outward/entities/outward.entity';

@Entity('lots')
export class Lot {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  lotNumber !: string;

  @Column()
  typeOfItem !: string;

  @Column()
  warehouseId !: string;

  @ManyToOne(()=> Warehouse)
  @JoinColumn({name: 'warehouseId'})
  warehouse!: Warehouse;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer !: Customer;

  @Column()
  noOfBags !: number;

  @CreateDateColumn()
    createdAt!: Date;
  
  @UpdateDateColumn()
    updatedAt!: Date;

  @Column({ nullable: true })
  inwardId!: string;

  // @ManyToOne(() => Inward)
  // @JoinColumn({ name: 'inwardId' })
  // inward!: Inward;

  // @Column({ nullable: true })
  // inwardDate!: Date;

  // @Column({ nullable: true })
  // outwardId!: string;

  // @ManyToOne(() => Outward)
  // @JoinColumn({ name: 'outwardId' })
  // outward!: Outward;

  // @Column({ nullable: true })
  // outwardDate!: Date;

  @Column({
    type : 'enum',
    enum : ["Inward", "Outward"],
    default : "Inward",
  })
  lotStatus !: string;
}
