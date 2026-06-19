import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  list(storeId: number): Promise<CategoryEntity[]> {
    return this.repo.find({
      where: { storeId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  findById(id: number, storeId: number): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { id, storeId } });
  }

  findByName(storeId: number, name: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { storeId, name } });
  }

  async maxSortOrder(storeId: number): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('c')
      .select('MAX(c.sortOrder)', 'max')
      .where('c.storeId = :storeId', { storeId })
      .getRawOne<{ max: number | null }>();
    return row?.max ?? 0;
  }

  save(entity: CategoryEntity): Promise<CategoryEntity> {
    return this.repo.save(entity);
  }

  create(data: Partial<CategoryEntity>): CategoryEntity {
    return this.repo.create(data);
  }

  remove(entity: CategoryEntity): Promise<CategoryEntity> {
    return this.repo.remove(entity);
  }

  findByIds(ids: number[], storeId: number): Promise<CategoryEntity[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids), storeId } });
  }
}
