import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Category } from '@table-order/shared-types';
import { CategoryEntity } from '../entities/category.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

function toDto(e: CategoryEntity): Category {
  return {
    id: e.id,
    storeId: e.storeId,
    name: e.name,
    sortOrder: e.sortOrder,
  };
}

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    @InjectRepository(MenuEntity) private readonly menuRepo: Repository<MenuEntity>,
  ) {}

  async list(storeId: number): Promise<Category[]> {
    const rows = await this.categoryRepo.list(storeId);
    return rows.map(toDto);
  }

  async create(dto: CreateCategoryDto, storeId: number): Promise<Category> {
    const dup = await this.categoryRepo.findByName(storeId, dto.name);
    if (dup) throw new ConflictException('이미 존재하는 카테고리명입니다');
    const next = (await this.categoryRepo.maxSortOrder(storeId)) + 1;
    const entity = this.categoryRepo.create({ storeId, name: dto.name, sortOrder: next });
    const saved = await this.categoryRepo.save(entity);
    return toDto(saved);
  }

  async update(id: number, dto: UpdateCategoryDto, storeId: number): Promise<Category> {
    const found = await this.categoryRepo.findById(id, storeId);
    if (!found) throw new NotFoundException('카테고리를 찾을 수 없습니다');
    if (dto.name && dto.name !== found.name) {
      const dup = await this.categoryRepo.findByName(storeId, dto.name);
      if (dup) throw new ConflictException('이미 존재하는 카테고리명입니다');
      found.name = dto.name;
    }
    if (dto.sortOrder !== undefined) {
      found.sortOrder = dto.sortOrder;
    }
    const saved = await this.categoryRepo.save(found);
    return toDto(saved);
  }

  async delete(id: number, storeId: number): Promise<void> {
    const found = await this.categoryRepo.findById(id, storeId);
    if (!found) throw new NotFoundException('카테고리를 찾을 수 없습니다');
    const linked = await this.menuRepo.count({ where: { categoryId: id, storeId } });
    if (linked > 0) {
      throw new ConflictException('연결된 메뉴를 먼저 정리하세요');
    }
    await this.categoryRepo.remove(found);
  }

  async reorder(orderedIds: number[], storeId: number): Promise<Category[]> {
    const rows = await this.categoryRepo.findByIds(orderedIds, storeId);
    if (rows.length !== orderedIds.length) {
      throw new BadRequestException('잘못된 카테고리 ID 가 포함되어 있습니다');
    }
    const map = new Map(rows.map((r) => [r.id, r]));
    for (let i = 0; i < orderedIds.length; i++) {
      const r = map.get(orderedIds[i]!);
      if (r) r.sortOrder = i + 1;
    }
    const saved = await Promise.all(Array.from(map.values()).map((r) => this.categoryRepo.save(r)));
    return saved
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toDto);
  }
}
