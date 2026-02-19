
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inward')
export class Inward {

  @PrimaryGeneratedColumn()
  id: number;

}
