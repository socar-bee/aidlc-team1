import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Menu } from '@table-order/shared-types';
import { MenuEntity } from '../entities/menu.entity';
import { MenuRepository } from '../repositories/menu.repository';
import { CategoryRepository } from '../../category/repositories/category.repository';
import { CreateMenuDto, UpdateMenuDto } from '../dto';

function toDto(e: MenuEntity): Menu {
  return {
    id: e.id,
    storeId: e.storeId,
    categoryId: e.categoryId,
    name: e.name,
    price: Number(e.price),
    description: e.description,
    imageUrl: e.imageUrl,
    sortOrder: e.sortOrder,
    isActive: e.isActive,
  };
}

@Injectable()
export class MenuService {
  constructor(
    private readonly menuRepo: MenuRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async list(storeId: number, filter?: { categoryId?: number; isActive?: boolean }): Promise<Menu[]> {
    const rows = await this.menuRepo.list(storeId, filter);
    return rows.map(toDto);
  }

  async findOne(id: number, storeId: number): Promise<Menu> {
    const row = await this.menuRepo.findById(id, storeId);
    if (!row) throw new NotFoundException('메뉴를 찾을 수 없습니다');
    return toDto(row);
  }

  async create(dto: CreateMenuDto, storeId: number): Promise<Menu> {
    const category = await this.categoryRepo.findById(dto.categoryId, storeId);
    if (!category) throw new BadRequestException('카테고리를 찾을 수 없습니다');
    const next = (await this.menuRepo.maxSortOrderInCategory(storeId, dto.categoryId)) + 1;
    const entity = this.menuRepo.create({
      storeId,
      categoryId: dto.categoryId,
      name: dto.name,
      price: dto.price.toFixed(2),
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      sortOrder: next,
      isActive: true,
    });
    const saved = await this.menuRepo.save(entity);
    return toDto(saved);
  }

  async update(id: number, dto: UpdateMenuDto, storeId: number): Promise<Menu> {
    const found = await this.menuRepo.findById(id, storeId);
    if (!found) throw new NotFoundException('메뉴를 찾을 수 없습니다');

    if (dto.categoryId !== undefined && dto.categoryId !== found.categoryId) {
      const category = await this.categoryRepo.findById(dto.categoryId, storeId);
      if (!category) throw new BadRequestException('카테고리를 찾을 수 없습니다');
      found.categoryId = dto.categoryId;
    }
    if (dto.name !== undefined) found.name = dto.name;
    if (dto.price !== undefined) found.price = dto.price.toFixed(2);
    if (dto.description !== undefined) found.description = dto.description;
    if (dto.imageUrl !== undefined) found.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) found.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) found.isActive = dto.isActive;

    const saved = await this.menuRepo.save(found);
    return toDto(saved);
  }

  async delete(id: number, storeId: number): Promise<void> {
    const found = await this.menuRepo.findById(id, storeId);
    if (!found) throw new NotFoundException('메뉴를 찾을 수 없습니다');
    await this.menuRepo.remove(found);
  }

  async reorder(categoryId: number, orderedIds: number[], storeId: number): Promise<Menu[]> {
    const rows = await this.menuRepo.findByIds(orderedIds, storeId);
    if (rows.length !== orderedIds.length) {
      throw new BadRequestException('잘못된 메뉴 ID 가 포함되어 있습니다');
    }
    const wrongCategory = rows.find((r) => r.categoryId !== categoryId);
    if (wrongCategory) {
      throw new BadRequestException('다른 카테고리의 메뉴가 포함되어 있습니다');
    }
    const map = new Map(rows.map((r) => [r.id, r]));
    for (let i = 0; i < orderedIds.length; i++) {
      const r = map.get(orderedIds[i]!);
      if (r) r.sortOrder = i + 1;
    }
    const saved = await this.menuRepo.saveAll(Array.from(map.values()));
    return saved.sort((a, b) => a.sortOrder - b.sortOrder).map(toDto);
  }
}
