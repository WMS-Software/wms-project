
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('billing')
export class Billing {

  @PrimaryGeneratedColumn()
  id: number;

}
