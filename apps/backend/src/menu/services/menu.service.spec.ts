import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MenuService } from './menu.service';
import { MenuRepository } from '../repositories/menu.repository';
import { CategoryRepository } from '../../category/repositories/category.repository';
import { MenuEntity } from '../entities/menu.entity';
import { CategoryEntity } from '../../category/entities/category.entity';

describe('MenuService', () => {
  let menuRepo: jest.Mocked<MenuRepository>;
  let categoryRepo: jest.Mocked<CategoryRepository>;
  let service: MenuService;

  beforeEach(() => {
    menuRepo = createMock<MenuRepository>();
    categoryRepo = createMock<CategoryRepository>();
    service = new MenuService(menuRepo, categoryRepo);
  });

  it('create: 가격은 소수 2자리 문자열로 저장되고 isActive=true', async () => {
    categoryRepo.findById.mockResolvedValue({ id: 1 } as CategoryEntity);
    menuRepo.maxSortOrderInCategory.mockResolvedValue(0);
    menuRepo.create.mockImplementation((x) => x as MenuEntity);
    menuRepo.save.mockImplementation(async (e) => ({ ...(e as MenuEntity), id: 10 }));

    const result = await service.create(
      { categoryId: 1, name: '아메리카노', price: 4500 } as never,
      7,
    );
    expect(result.price).toBe(4500);
    expect(result.isActive).toBe(true);
    expect(result.sortOrder).toBe(1);
  });

  it('create: 카테고리가 없으면 BadRequestException', async () => {
    categoryRepo.findById.mockResolvedValue(null);
    await expect(
      service.create({ categoryId: 99, name: 'x', price: 1000 } as never, 7),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findOne: 없는 메뉴면 NotFoundException', async () => {
    menuRepo.findById.mockResolvedValue(null);
    await expect(service.findOne(1, 7)).rejects.toBeInstanceOf(NotFoundException);
  });
});
