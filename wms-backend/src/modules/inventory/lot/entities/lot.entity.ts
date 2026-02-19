
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lot')
export class Lot {

  @PrimaryGeneratedColumn()
  id: number;

}
