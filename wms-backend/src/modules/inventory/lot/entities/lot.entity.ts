
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Inward } from 'src/modules/operations/inward/entities/inward.entity';
//import { Outward } from 'src/modules/operations/outward/entities/outward.entity';

@Entity('lots')
@Unique(['warehouseId', 'lotCode'])
export class Lot {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column({ unique: true })
  lotCode !: string;

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
  initialQuantity!: number;   // inward time

  @Column()
  availableQuantity!: number;

  @CreateDateColumn()
    createdAt!: Date;
  
  @UpdateDateColumn()
    updatedAt!: Date;

  @Column()
  inwardId?: string;

  // @ManyToOne(() => Inward)
  // @JoinColumn({ name: 'inwardId' })
  // inward!: Inward;

  // @Column({ nullable: true })
  // inwardDate!: Date;


  //Iske liye ek alg se outward item table banegi toh phir humme kyonki outward ek se jyada time hoga aur agr hum usko issi table mei rakhenge
  //nayi waaki value purani waali value ko overwrite kr degi

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


  @Column({ type: 'int', default: 0 })
  sequenceNumber!: number;

  @Column({ default: true })
  isActive!: boolean;
}
