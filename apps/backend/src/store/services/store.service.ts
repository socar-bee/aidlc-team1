import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../entities/store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepo: Repository<StoreEntity>,
  ) {}

  findByCode(code: string): Promise<StoreEntity | null> {
    return this.storeRepo.findOne({ where: { code } });
  }

  findById(id: number): Promise<StoreEntity | null> {
    return this.storeRepo.findOne({ where: { id } });
  }

  /** single-store helper — returns first store (PoC assumption). */
  async getCurrent(): Promise<StoreEntity | null> {
    return this.storeRepo.findOne({ where: {}, order: { id: 'ASC' } });
  }
}
