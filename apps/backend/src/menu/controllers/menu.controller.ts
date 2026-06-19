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
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import type { AdminUserPayload, Menu, TablePayload } from '@table-order/shared-types';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto, ReorderMenusDto, UpdateMenuDto } from '../dto';
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { OptionalAdmin } from '../../common/decorators/optional-admin.decorator';
import { OptionalTable } from '../../common/decorators/optional-table.decorator';
import { StoreService } from '../../store/services/store.service';

class MenuListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}

@Controller('menus')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly storeService: StoreService,
  ) {}

  /** read — Admin/Table 토큰이면 해당 매장, 아니면 기본 매장(getCurrent) */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async list(
    @Query() query: MenuListQueryDto,
    @OptionalAdmin() admin: AdminUserPayload | null,
    @OptionalTable() table: TablePayload | null,
  ): Promise<Menu[]> {
    const storeId =
      admin?.storeId ?? table?.storeId ?? (await this.storeService.getCurrent())?.id;
    if (!storeId) return [];
    const filter: { categoryId?: number; isActive?: boolean } = { isActive: true };
    if (query.categoryId !== undefined) filter.categoryId = query.categoryId;
    return this.menuService.list(storeId, filter);
  }

  /** read — Admin/Table 토큰이면 해당 매장, 아니면 기본 매장(getCurrent) */
  @Get('by-category/:id')
  @UseGuards(OptionalAuthGuard)
  async listByCategory(
    @Param('id', ParseIntPipe) id: number,
    @OptionalAdmin() admin: AdminUserPayload | null,
    @OptionalTable() table: TablePayload | null,
  ): Promise<Menu[]> {
    const storeId =
      admin?.storeId ?? table?.storeId ?? (await this.storeService.getCurrent())?.id;
    if (!storeId) return [];
    return this.menuService.list(storeId, { categoryId: id, isActive: true });
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  create(@Body() dto: CreateMenuDto, @CurrentAdmin() admin: AdminUserPayload): Promise<Menu> {
    return this.menuService.create(dto, admin.storeId);
  }

  @Patch('reorder')
  @UseGuards(JwtAdminGuard)
  reorder(
    @Body() dto: ReorderMenusDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Menu[]> {
    return this.menuService.reorder(dto.categoryId, dto.orderedIds, admin.storeId);
  }

  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Menu> {
    return this.menuService.update(id, dto, admin.storeId);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<void> {
    return this.menuService.delete(id, admin.storeId);
  }
}
