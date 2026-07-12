
import {  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BagStatus } from './bag_status.enum';
import { Lot } from '../../lot/entities/lot.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Index([ 'lotId', 'status'])                               // GIVE INDEX TO BOTH
@Index([ 'lotId', 'serial'],{ unique: true })                               // GIVE INDEX TO BOTH
@Entity('bags')
export class Bag {

  @PrimaryGeneratedColumn('uuid')
  id !: string;                                               // BAG ID

  @Column({unique: true})
  bagCode !: string;

  @Column()
  serial !: number;

  @Column()
  lotId !: string;                                            // FK LOT 

  // @ManyToOne(() => Lot, {nullable:false})
  // @JoinColumn({name: 'lotId'})                   // write now i dont have lot table we use this to acces lot id from lot table   
  // lot: Lot;

  @Column({unique: true})
  barcode !: string;

  @CreateDateColumn()
  createdAt !: Date;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  dispatchedAt !: Date;

  
  @Column({
    type: 'timestamp',
    nullable: true
  })
  cancelledAt !: Date;

  @Column({
    type: 'enum',
    enum: BagStatus,
    enumName: 'bag_status_enum',       
    default: BagStatus.pending
  })
  status !: BagStatus;

  @ManyToOne(() => Rack, {nullable: true})
  @JoinColumn({name: 'rackId'})
  rack ?: Rack;

  @Column({nullable: true})
  rackId ?: string | null;

  @Column({type: 'timestamp', nullable: true})
  scannedAt ?: Date;

  

}