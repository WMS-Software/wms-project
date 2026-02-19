
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chamber')
export class Chamber {

  @PrimaryGeneratedColumn()
  id: number;

}
