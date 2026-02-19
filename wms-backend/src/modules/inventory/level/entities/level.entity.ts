
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('level')
export class Level {

  @PrimaryGeneratedColumn()
  id: number;

}
