
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rack')
export class Rack {

  @PrimaryGeneratedColumn()
  id: number;

}
