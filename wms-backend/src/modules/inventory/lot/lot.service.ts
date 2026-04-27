
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { Repository } from 'typeorm';
import { Customer } from 'src/modules/partner/customer/entities/customer.entity';
import { Lot } from './entities/lot.entity';
import { CreateLotDto } from './dto/lot.dto';
import { Inward } from 'src/modules/operations/inward/entities/inward.entity';

@Injectable()
export class LotService {
     constructor(
                    @InjectRepository(Warehouse)
                    private  readonly warehouseRepo: Repository<Warehouse>,
            
                    @InjectRepository(Customer)
                    private  readonly customerRepo: Repository<Customer>,

                    @InjectRepository(Lot)
                    private  readonly lotRepo: Repository<Lot>,

                    @InjectRepository(Inward)
                    private  readonly inwardRepo: Repository<Inward>
                ){}
    
    
    
    
                async createLot(
                            dto : CreateLotDto,
                            warehouseId : string,
                            customerId : string,
                            inwardId : string,
                        ):Promise<Lot>{
                    
                    
                            try {

                                const warehouse = await this.warehouseRepo.findOne({
                                    where: {
                                        id: warehouseId,
                                        isActive: true
                                    }
                                })
                    
                                if(!warehouse){
                                    throw new NotFoundException('warehouse not found');
                                }

                                const inward = await this.inwardRepo.findOne({
                                    where: {
                                        id: inwardId,
                                        warehouseId: warehouseId
                                    }
                                })

                                if(!inward){
                                    throw new NotFoundException('No inward operation exist');
                                }

                                const existingLot = await this.lotRepo.findOne({
                                    where:{inwardId}
                                })

                                if(existingLot){
                                    throw new BadRequestException('Lot already exists for this inward operation')
                                }

                                const customer = await this.customerRepo.findOne({
                                    where: {
                                        id: customerId,
                                    }
                                })

                                if(!customer){
                                    throw new NotFoundException('customer not found');
                                }
                    
                    
                                const lot = this.lotRepo.create({
                                    lotNumber: dto.lotNumber,
                                    typeOfItem: dto.typeOfItem,
                                    initialQuantity: dto.initialQuantity,
                                    availableQuantity: dto.initialQuantity, // system controlled
                                    warehouseId,
                                    customerId,
                                    inwardId
                            })
                    
                            return this.lotRepo.save(lot);
                            }
                    
                            catch (error:any) {
                                console.error('Error in creating lot:', error.message);
                                
                                      if (error instanceof NotFoundException) {
                                        throw error;
                                      }
                    
                                      if(error.code === '23505'){
                                        throw new InternalServerErrorException(`Lot ${dto.lotNumber} already exists`);
                                      }
                                
                                      throw new InternalServerErrorException('Failed to create Lot');
                            }
                        }
                    
                    
                        //Find all levels
                    
                    
                    
                    
                        async findAllLots(warehouseId: string, customerId: string): Promise<Lot[]>{
                            const lots = await this.lotRepo.find({
                                where: {
                                    warehouseId: warehouseId,
                                    customerId: customerId,
                                    isActive: true
                                },
                                relations: ['customer', 'inward']
                            })

                            if(!lots.length){
                                throw new NotFoundException('No lots found')
                            }
                            return lots;
                        }
                    
                    
                        //Find level by ID
                    
                    
                    
                    
                    
                        async findLotById(id: string):Promise<Lot>{
                            const lot = await this.lotRepo.findOne({
                                where:{id: id, isActive: true},
                                relations: ['customer', 'inward'],
                            });
                    
                            if(!lot){
                                throw new NotFoundException('Lot not found');
                            }
                    
                            return lot;
                        }
                    
                    
                        //Update level by ID
                    
                    
                    
                    
                        // async updateLot(id: string, dto:Partial<CreateLotDto>): Promise<Rack>{
                            
                        //     const lot = await this.findLotById(id);
                    
                        //     //Agr new level number provided hoga toh he update hoga vrna agr undefined ya null hua toh purana level no. he rahega
                        //     lot.rackNumber = dto.rackNumber ?? rack.rackNumber;
                    
                        //     try {
                        //         return this.rackRepo.save(rack);
                        //     } catch (error:any) {
                        //         if(error.code === '23505'){
                        //             throw new InternalServerErrorException(`Rack ${dto.rackNumber} already exists in level`);
                        //         }
                    
                        //         throw new InternalServerErrorException('Failed in updating rack');
                        //     }
                        // }
                    
                    
                        //Delete level by ID soft delete only
                    
                    
                    
                    
                    
                        async deleteLot(id: string): Promise<{message: string}>{
                            const lot = await this.findLotById(id);

                            if(lot.availableQuantity > 0){
                                throw new BadRequestException(
                                'Cannot delete lot with remaining stock'
                            );
                        }
                    
                            lot.isActive = false;
                    
                            await this.lotRepo.save(lot);
                            return {message: 'Lot deleted successfully'};
                        }
}
