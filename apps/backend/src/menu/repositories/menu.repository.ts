import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { MenuEntity } from '../entities/menu.entity';

@Injectable()
export class MenuRepository {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly repo: Repository<MenuEntity>,
  ) {}

  list(storeId: number, filter?: { categoryId?: number; isActive?: boolean }): Promise<MenuEntity[]> {
    const where: FindOptionsWhere<MenuEntity> = { storeId };
    if (filter?.categoryId !== undefined) where.categoryId = filter.categoryId;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;
    return this.repo.find({
      where,
      order: { categoryId: 'ASC', sortOrder: 'ASC', id: 'ASC' },
    });
  }

  findById(id: number, storeId: number): Promise<MenuEntity | null> {
    return this.repo.findOne({ where: { id, storeId } });
  }

  findByIds(ids: number[], storeId: number): Promise<MenuEntity[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids), storeId } });
  }

  async maxSortOrderInCategory(storeId: number, categoryId: number): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('m')
      .select('MAX(m.sortOrder)', 'max')
      .where('m.storeId = :storeId AND m.categoryId = :categoryId', { storeId, categoryId })
      .getRawOne<{ max: number | null }>();
    return row?.max ?? 0;
  }

  create(data: Partial<MenuEntity>): MenuEntity {
    return this.repo.create(data);
  }

  save(entity: MenuEntity): Promise<MenuEntity> {
    return this.repo.save(entity);
  }

  saveAll(entities: MenuEntity[]): Promise<MenuEntity[]> {
    return this.repo.save(entities);
  }

  remove(entity: MenuEntity): Promise<MenuEntity> {
    return this.repo.remove(entity);
  }
}
