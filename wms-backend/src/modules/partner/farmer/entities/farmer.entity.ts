
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('farmer')
export class Farmer {

  @PrimaryGeneratedColumn()
  id: number;

}
