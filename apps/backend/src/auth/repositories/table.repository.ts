import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity';

@Injectable()
export class TableRepository {
  constructor(
    @InjectRepository(TableEntity)
    private readonly repo: Repository<TableEntity>,
  ) {}

  findByStoreAndNumber(storeId: number, tableNumber: number): Promise<TableEntity | null> {
    return this.repo.findOne({ where: { storeId, tableNumber } });
  }

  findById(id: number): Promise<TableEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  listByStore(storeId: number): Promise<TableEntity[]> {
    return this.repo.find({ where: { storeId }, order: { tableNumber: 'ASC' } });
  }

  upsert(data: {
    id?: number;
    storeId: number;
    tableNumber: number;
    passwordHash: string;
  }): Promise<TableEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
