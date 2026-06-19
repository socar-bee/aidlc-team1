import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AdminUserPayload, Category, TablePayload } from '@table-order/shared-types';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from '../dto';
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { OptionalAdmin } from '../../common/decorators/optional-admin.decorator';
import { OptionalTable } from '../../common/decorators/optional-table.decorator';
import { StoreService } from '../../store/services/store.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}

  /** read — Admin/Table 토큰이면 해당 매장, 아니면 기본 매장(getCurrent) */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async list(
    @OptionalAdmin() admin: AdminUserPayload | null,
    @OptionalTable() table: TablePayload | null,
  ): Promise<Category[]> {
    const storeId =
      admin?.storeId ?? table?.storeId ?? (await this.storeService.getCurrent())?.id;
    if (!storeId) return [];
    return this.categoryService.list(storeId);
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  create(@Body() dto: CreateCategoryDto, @CurrentAdmin() admin: AdminUserPayload): Promise<Category> {
    return this.categoryService.create(dto, admin.storeId);
  }

  @Patch('reorder')
  @UseGuards(JwtAdminGuard)
  reorder(
    @Body() dto: ReorderCategoriesDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Category[]> {
    return this.categoryService.reorder(dto.orderedIds, admin.storeId);
  }

  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Category> {
    return this.categoryService.update(id, dto, admin.storeId);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<void> {
    return this.categoryService.delete(id, admin.storeId);
  }
}
