import { createMock } from '@golevelup/ts-jest';
import type { TableSession } from '@table-order/shared-types';
import { TableService } from './table.service';
import { TableRepository } from '../../auth/repositories/table.repository';
import { SessionService } from '../../session/services/session.service';
import { OrderRepository } from '../../order/repositories/order.repository';
import { TableEntity } from '../../auth/entities/table.entity';
import { OrderEntity } from '../../order/entities/order.entity';

describe('TableService.buildSummaries (대시보드 폴링)', () => {
  let tableRepo: jest.Mocked<TableRepository>;
  let sessions: jest.Mocked<SessionService>;
  let orders: jest.Mocked<OrderRepository>;
  let service: TableService;

  beforeEach(() => {
    tableRepo = createMock<TableRepository>();
    sessions = createMock<SessionService>();
    orders = createMock<OrderRepository>();
    service = new TableService(tableRepo, sessions, orders);
  });

  it('빈 테이블은 totalAmount=0, 활성 세션이 있으면 주문 합계·미리보기를 채운다', async () => {
    tableRepo.listByStore.mockResolvedValue([
      { id: 1, tableNumber: 1 } as TableEntity,
      { id: 2, tableNumber: 2 } as TableEntity,
    ]);
    sessions.findActive.mockImplementation(async (tableId: number) =>
      tableId === 2 ? ({ id: 50, tableId: 2, startedAt: '', endedAt: null } as TableSession) : null,
    );
    orders.listBySession.mockResolvedValue([
      {
        id: 1,
        orderNumber: '50-001',
        totalAmount: '14000.00',
        createdAt: new Date('2026-06-19T12:00:00Z'),
        items: [{ menuNameSnapshot: '아메리카노', quantity: 2 }],
      } as unknown as OrderEntity,
    ]);

    const result = await service.buildSummaries(7);

    expect(result[0]).toMatchObject({ tableId: 1, activeSessionId: null, totalAmount: 0 });
    expect(result[1]).toMatchObject({ tableId: 2, activeSessionId: 50, totalAmount: 14000 });
    expect(result[1]!.recentOrderPreviews[0]!.itemsSummary).toBe('아메리카노×2');
  });
});
