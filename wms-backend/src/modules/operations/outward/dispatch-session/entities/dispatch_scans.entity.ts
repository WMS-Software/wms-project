import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { DispatchScanStatus } from "./dispatchScan_Status.enum";


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

  @Column({
      type: 'enum',
  enum: DispatchScanStatus,
  default: DispatchScanStatus.active,
  })
  status!: DispatchScanStatus

  @CreateDateColumn()
  scannedAt!: Date;
}