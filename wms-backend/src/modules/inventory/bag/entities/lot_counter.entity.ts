import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity('lot_counters')
export class LotCounter {

    @PrimaryColumn()
    lotId !: string;

    @Column({type: 'int', default: 0}) 
    currentSerial !: number;

}