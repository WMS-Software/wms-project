
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment')
export class Payment {

  @PrimaryGeneratedColumn()
  id: number;

}
