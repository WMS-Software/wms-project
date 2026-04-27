import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.repo.create({
      ...dto,
      password: hashedPassword,
    });

    const saved = await this.repo.save(user);

    //  REMOVE PASSWORD FROM RESPONSE
    const { password, ...result } = saved;
    return result;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    const { password, ...result } = user;
    return result;
  }
}