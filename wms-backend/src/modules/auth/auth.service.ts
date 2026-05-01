import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { Warehouse } from 'src/modules/inventory/warehouse/entities/warehouse.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,

    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,
  ) {}

  async login(dto: LoginUserDto) {
    let user;

    if (dto.warehouseCode) {
      const warehouse = await this.warehouseRepo.findOne({
        where: { warehouseCode: dto.warehouseCode },
      });

      if (!warehouse) {
        throw new UnauthorizedException('Invalid warehouse code');
      }

      user = await this.userService.findById(warehouse.userId);
    }

    else if (dto.email) {
      user = await this.userService.findByEmail(dto.email);
    }

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
