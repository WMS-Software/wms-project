
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer')
export class Customer {

  @PrimaryGeneratedColumn()
  id: number;

}
