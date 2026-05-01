
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Chamber } from '../../chamber/entities/chamber.entity';
import { RackStatus } from './rack_status.enum';

@Unique(['chamberId', 'rackNumber'])
@Entity('racks')
export class Rack {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  rackNumber !: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  chamberId !: string;

  @ManyToOne(()=> Chamber)
  @JoinColumn({name : 'chamberId'})
  chamber !: Chamber;

  @Column({
    type: 'enum',
    enum: RackStatus,
    enumName: 'rack_status_enum',       
    default: RackStatus.available
  })
  status !: RackStatus;

  @CreateDateColumn()
    createdAt!: Date;
      
  @Column()
    capacity!: number;

  @Column({default:0})
    currentBags!: number;

  @Column({ default: false })
    isBusy!: boolean;

  @UpdateDateColumn()
    updatedAt!: Date;
}

