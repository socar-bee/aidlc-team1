import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import type { DataSource, EntityManager } from 'typeorm';
import { OrderStatus } from '@table-order/shared-types';
import type { AdminUserPayload } from '@table-order/shared-types';
import { OrderService } from './order.service';
import { SessionService } from '../../session/services/session.service';
import { OrderRepository } from '../repositories/order.repository';
import { TableRepository } from '../../auth/repositories/table.repository';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

const ADMIN: AdminUserPayload = { id: 1, storeId: 7, username: 'admin' };

function order(status: OrderStatus, tableId = 3): OrderEntity {
  return {
    id: 100,
    sessionId: 10,
    tableId,
    orderNumber: '10-001',
    totalAmount: '14000.00',
    status,
    createdAt: new Date('2026-06-19T12:00:00Z'),
    canceledAt: null,
  } as OrderEntity;
}

function buildManager(found: OrderEntity) {
  const orderRepo = {
    findOne: jest.fn().mockResolvedValue(found),
    save: jest.fn(async (o: OrderEntity) => o),
  };
  const itemRepo = { find: jest.fn().mockResolvedValue([]) };
  const manager = {
    getRepository: jest.fn((entity: unknown) => {
      if (entity === OrderEntity) return orderRepo;
      if (entity === OrderItemEntity) return itemRepo;
      throw new Error('unexpected entity');
    }),
  } as unknown as EntityManager;
  return manager;
}

describe('OrderService.changeStatus (상태 전이 + 비관적 락 + 매장 검증)', () => {
  let dataSource: jest.Mocked<DataSource>;
  let tableRepo: jest.Mocked<TableRepository>;
  let service: OrderService;

  function setup(found: OrderEntity, tableStoreId: number) {
    dataSource = createMock<DataSource>();
    tableRepo = createMock<TableRepository>();
    tableRepo.findById.mockResolvedValue({ id: found.tableId, storeId: tableStoreId } as never);
    const manager = buildManager(found);
    (dataSource.transaction as jest.Mock).mockImplementation(
      (cb: (m: EntityManager) => Promise<unknown>) => cb(manager),
    );
    service = new OrderService(
      dataSource,
      createMock<SessionService>(),
      createMock<OrderRepository>(),
      tableRepo,
    );
  }

  it('정방향 전이(PENDING→PREPARING)는 허용', async () => {
    setup(order(OrderStatus.PENDING), 7);
    const res = await service.changeStatus(100, OrderStatus.PREPARING, ADMIN);
    expect(res.status).toBe(OrderStatus.PREPARING);
  });

  it('역방향/불가 전이(PENDING→COMPLETED)는 BadRequestException', async () => {
    setup(order(OrderStatus.PENDING), 7);
    await expect(
      service.changeStatus(100, OrderStatus.COMPLETED, ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('다른 매장 주문이면 ForbiddenException', async () => {
    setup(order(OrderStatus.PENDING), 999);
    await expect(
      service.changeStatus(100, OrderStatus.PREPARING, ADMIN),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
