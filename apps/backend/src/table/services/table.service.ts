import { Injectable } from '@nestjs/common';
import type { TableSummary } from '@table-order/shared-types';
import { OrderItemEntity } from '../../order/entities/order-item.entity';
import { OrderRepository } from '../../order/repositories/order.repository';
import { SessionService } from '../../session/services/session.service';
import { TableRepository } from '../../auth/repositories/table.repository';

const PREVIEW_COUNT = 3;

function summarizeItems(items: OrderItemEntity[]): string {
  if (items.length === 0) return '';
  const first = `${items[0]!.menuNameSnapshot}×${items[0]!.quantity}`;
  return items.length > 1 ? `${first} 외 ${items.length - 1}건` : first;
}

@Injectable()
export class TableService {
  constructor(
    private readonly tableRepo: TableRepository,
    private readonly sessions: SessionService,
    private readonly orders: OrderRepository,
  ) {}

  /** 등록된 테이블 목록 (필터 드롭다운 / 등록 화면) */
  async listTables(storeId: number): Promise<Array<{ id: number; tableNumber: number }>> {
    const rows = await this.tableRepo.listByStore(storeId);
    return rows.map((t) => ({ id: t.id, tableNumber: t.tableNumber }));
  }

  /** 대시보드 그리드 — 빈 테이블 포함 전체 테이블의 현재 세션 요약 */
  async buildSummaries(storeId: number): Promise<TableSummary[]> {
    const tables = await this.tableRepo.listByStore(storeId);
    const summaries: TableSummary[] = [];

    for (const table of tables) {
      const active = await this.sessions.findActive(table.id);
      if (!active) {
        summaries.push({
          tableId: table.id,
          tableNumber: table.tableNumber,
          activeSessionId: null,
          totalAmount: 0,
          recentOrderPreviews: [],
        });
        continue;
      }
      const orders = await this.orders.listBySession(active.id);
      const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      summaries.push({
        tableId: table.id,
        tableNumber: table.tableNumber,
        activeSessionId: active.id,
        totalAmount,
        recentOrderPreviews: orders.slice(0, PREVIEW_COUNT).map((o) => ({
          orderNumber: o.orderNumber,
          itemsSummary: summarizeItems(o.items ?? []),
          createdAt: o.createdAt.toISOString(),
        })),
      });
    }
    return summaries;
  }
}
