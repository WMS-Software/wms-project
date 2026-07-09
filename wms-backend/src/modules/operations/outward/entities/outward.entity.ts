import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { outwardStatus } from './outward_Status.enum';

@Entity('outward')
export class Outward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

}
