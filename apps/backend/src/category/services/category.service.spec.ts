import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import type { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';

describe('CategoryService', () => {
  let repo: jest.Mocked<CategoryRepository>;
  let menuRepo: jest.Mocked<Repository<MenuEntity>>;
  let service: CategoryService;

  beforeEach(() => {
    repo = createMock<CategoryRepository>();
    menuRepo = createMock<Repository<MenuEntity>>();
    service = new CategoryService(repo, menuRepo);
  });

  it('create: 신규 카테고리는 sortOrder=max+1 로 저장', async () => {
    repo.findByName.mockResolvedValue(null);
    repo.maxSortOrder.mockResolvedValue(2);
    repo.create.mockImplementation((x) => x as CategoryEntity);
    repo.save.mockImplementation(async (e) => ({ ...(e as CategoryEntity), id: 1 }));

    const result = await service.create({ name: '음료' }, 7);
    expect(result.sortOrder).toBe(3);
    expect(result.name).toBe('음료');
  });

  it('create: 중복 이름이면 ConflictException', async () => {
    repo.findByName.mockResolvedValue({ id: 9 } as CategoryEntity);
    await expect(service.create({ name: '음료' }, 7)).rejects.toBeInstanceOf(ConflictException);
  });

  it('delete: 연결된 메뉴가 있으면 ConflictException', async () => {
    repo.findById.mockResolvedValue({ id: 1 } as CategoryEntity);
    menuRepo.count.mockResolvedValue(2);
    await expect(service.delete(1, 7)).rejects.toBeInstanceOf(ConflictException);
  });

  it('delete: 없는 카테고리면 NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.delete(1, 7)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reorder: 잘못된 ID 가 포함되면 BadRequestException', async () => {
    repo.findByIds.mockResolvedValue([{ id: 1 } as CategoryEntity]);
    await expect(service.reorder([1, 2], 7)).rejects.toBeInstanceOf(BadRequestException);
  });
});
