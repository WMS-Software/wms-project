
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('warehouse')
export class Warehouse {

  @PrimaryGeneratedColumn()
  id: number;

}
