
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transporter')
export class Transporter {

  @PrimaryGeneratedColumn()
  id: number;

}
