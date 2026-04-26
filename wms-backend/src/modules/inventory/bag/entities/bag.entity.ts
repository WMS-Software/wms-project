
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag')
export class Bag {

  @PrimaryGeneratedColumn()
  id: number;

}
