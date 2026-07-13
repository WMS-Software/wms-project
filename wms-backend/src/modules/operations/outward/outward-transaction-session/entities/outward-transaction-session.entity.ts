import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { OutwardTransaction } from '../../outward-transaction/entities/outward-transaction.entity';
import { DispatchSession } from '../../dispatch-session/entities/dispatchSession.entity';

@Entity('outward_transaction_sessions')
@Unique(['dispatchSessionId'])
export class OutwardTransactionSession {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  outwardTransactionId!: string;

  @ManyToOne(
    () => OutwardTransaction,
    { nullable: false },
  )
  @JoinColumn({
    name: 'outwardTransactionId',
  })
  outwardTransaction!: OutwardTransaction;

  @Column()
  dispatchSessionId!: string;

  @ManyToOne(
    () => DispatchSession,
    { nullable: false },
  )
  @JoinColumn({
    name: 'dispatchSessionId',
  })
  dispatchSession!: DispatchSession;

  @CreateDateColumn()
  createdAt!: Date;
}