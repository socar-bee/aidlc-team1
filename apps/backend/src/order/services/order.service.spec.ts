import { BadRequestException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import type { DataSource, EntityManager } from 'typeorm';
import type { TablePayload } from '@table-order/shared-types';
import { OrderService } from './order.service';
import { SessionService } from '../../session/services/session.service';
import { OrderRepository } from '../repositories/order.repository';
import { TableRepository } from '../../auth/repositories/table.repository';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

const TABLE: TablePayload = { tableId: 3, storeId: 7, tableNumber: 1 };

function menu(id: number, price: string, isActive = true) {
  return { id, storeId: 7, name: `메뉴${id}`, price, isActive };
}

/**
 * dataSource.transaction(cb) 가 호출하는 cb 에 엔티티별 stub repository 를 주는
 * 가짜 EntityManager 를 구성한다. (DB 연결 없이 주문 합계 로직만 검증)
 */
function buildManager(menus: ReturnType<typeof menu>[]) {
  const menuRepo = { find: jest.fn().mockResolvedValue(menus) };
  const itemRepo = { create: jest.fn((x: unknown) => x) };
  const orderRepo = {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((x: Record<string, unknown>) => x),
    save: jest.fn(async (o: Record<string, unknown>) => ({
      ...o,
      id: 100,
      createdAt: new Date('2026-06-19T12:00:00Z'),
      canceledAt: null,
    })),
  };
  const manager = {
    getRepository: jest.fn((entity: unknown) => {
      if (entity === MenuEntity) return menuRepo;
      if (entity === OrderItemEntity) return itemRepo;
      if (entity === OrderEntity) return orderRepo;
      throw new Error('unexpected entity');
    }),
  } as unknown as EntityManager;
  return { manager, orderRepo };
}

describe('OrderService.create (주문 합계)', () => {
  let dataSource: jest.Mocked<DataSource>;
  let sessions: jest.Mocked<SessionService>;
  let service: OrderService;

  beforeEach(() => {
    dataSource = createMock<DataSource>();
    sessions = createMock<SessionService>();
    sessions.ensureActiveSession.mockResolvedValue({ id: 10 } as never);
    service = new OrderService(
      dataSource,
      sessions,
      createMock<OrderRepository>(),
      createMock<TableRepository>(),
    );
  });

  it('단가 × 수량 합으로 totalAmount 를 계산한다', async () => {
    const { manager } = buildManager([menu(1, '4500.00'), menu(2, '5000.00')]);
    (dataSource.transaction as jest.Mock).mockImplementation(
      (cb: (m: EntityManager) => Promise<unknown>) => cb(manager),
    );

    const result = await service.create(
      { items: [{ menuId: 1, quantity: 2 }, { menuId: 2, quantity: 1 }] },
      TABLE,
    );

    // 4500*2 + 5000*1 = 14000
    expect(result.totalAmount).toBe(14000);
    expect(result.items).toHaveLength(2);
    expect(result.orderNumber).toBe('10-001');
  });

  it('판매 중이 아닌 메뉴가 포함되면 BadRequestException', async () => {
    const { manager } = buildManager([menu(1, '4500.00', false)]);
    (dataSource.transaction as jest.Mock).mockImplementation(
      (cb: (m: EntityManager) => Promise<unknown>) => cb(manager),
    );

    await expect(
      service.create({ items: [{ menuId: 1, quantity: 1 }] }, TABLE),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
