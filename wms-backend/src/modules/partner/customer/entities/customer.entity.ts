
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer')
export class Customer {

  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
