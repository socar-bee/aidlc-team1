import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../entities/admin-user.entity';

@Injectable()
export class AdminUserRepository {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly repo: Repository<AdminUserEntity>,
  ) {}

  findByStoreAndUsername(storeId: number, username: string): Promise<AdminUserEntity | null> {
    return this.repo.findOne({ where: { storeId, username } });
  }

  create(data: { storeId: number; username: string; passwordHash: string }): Promise<AdminUserEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
