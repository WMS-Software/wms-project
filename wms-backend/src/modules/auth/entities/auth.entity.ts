
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth')
export class Auth {

  @PrimaryGeneratedColumn()
  id: number;

}
