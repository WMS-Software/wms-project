
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Level } from '../../level/entities/level.entity';

@Entity('chambers')
@Unique(['levelId','chamberNumber'])
export class Chamber {

  @PrimaryGeneratedColumn('uuid')
  id !: string;

  @Column()
  chamberNumber !: number;

  @Column()
  minTemperature!: number;

  @Column()
  maxTemperature!: number;

  @Column()
  levelId !: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(()=> Level)
  @JoinColumn({name: 'levelId'})
  level!: Level;

  @Column({
    type: 'enum',
    enum: ['EMPTY', 'PARTIALLY_FULL', 'FULL'],
    default: 'EMPTY',
  })
  status!: string;

  @CreateDateColumn()
    createdAt!: Date;
    
  @UpdateDateColumn()
    updatedAt!: Date;

}
