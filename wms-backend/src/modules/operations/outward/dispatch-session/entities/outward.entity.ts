import {
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('outward')
export class Outward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

}
