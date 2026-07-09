import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity('dispatch_scans')
@Unique(['dispatchSessionId', 'bagId'])
export class DispatchScan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  dispatchSessionId!: string;

  @Column()
  bagId!: string;

  @Column()
  barcode!: string;

  @CreateDateColumn()
  scannedAt!: Date;
}