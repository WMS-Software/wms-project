
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Chamber } from '../../chamber/entities/chamber.entity';

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
    type : 'enum',
    enum: ['EMPTY', 'PARTIALLY_FULL', 'FULL'],
    default: 'EMPTY',
  })
  status !: string

  @CreateDateColumn()
      createdAt!: Date;
      
  @UpdateDateColumn()
    updatedAt!: Date;
}
