import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import type {
  AdminUserPayload,
  Order,
  OrderListResponse,
  TableSession,
  TableSummary,
} from '@table-order/shared-types';
import { OrderService } from '../../order/services/order.service';
import { SessionService } from '../../session/services/session.service';
import { TableService } from '../services/table.service';
import { TableRepository } from '../../auth/repositories/table.repository';
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

class TableHistoryQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

@Controller('tables')
@UseGuards(JwtAdminGuard)
export class TableController {
  constructor(
    private readonly orderService: OrderService,
    private readonly sessionService: SessionService,
    private readonly tableService: TableService,
    private readonly tableRepo: TableRepository,
  ) {}

  /** 테이블 목록 (필터 / 등록 화면) */
  @Get()
  listTables(
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Array<{ id: number; tableNumber: number }>> {
    return this.tableService.listTables(admin.storeId);
  }

  /** 대시보드 그리드 요약 (빈 테이블 포함) */
  @Get('summary')
  summary(@CurrentAdmin() admin: AdminUserPayload): Promise<TableSummary[]> {
    return this.tableService.buildSummaries(admin.storeId);
  }

  /** 테이블 현재 세션 주문 (상세 모달) */
  @Get(':id/current-orders')
  async currentOrders(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Order[]> {
    await this.assertTableInStore(id, admin.storeId);
    return this.orderService.listCurrentByTableId(id);
  }

  /** 과거 주문 이력 (종료된 세션) */
  @Get(':id/history')
  async history(
    @Param('id', ParseIntPipe) id: number,
    @Query() q: TableHistoryQueryDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<OrderListResponse> {
    await this.assertTableInStore(id, admin.storeId);
    return this.orderService.listHistoryByTable(id, {
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      page: q.page,
      pageSize: q.pageSize,
    });
  }

  /** 세션 종료 (이용 완료) */
  @Post(':id/end-session')
  @HttpCode(HttpStatus.OK)
  async endSession(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<TableSession> {
    await this.assertTableInStore(id, admin.storeId);
    return this.sessionService.end(id);
  }

  private async assertTableInStore(tableId: number, storeId: number): Promise<void> {
    const table = await this.tableRepo.findById(tableId);
    if (!table || table.storeId !== storeId) {
      throw new NotFoundException('테이블을 찾을 수 없습니다');
    }
  }
}
