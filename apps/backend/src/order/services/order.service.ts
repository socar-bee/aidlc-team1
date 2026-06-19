import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { ORDER_STATUS_FORWARD_TRANSITIONS, OrderStatus } from '@table-order/shared-types';
import type {
  AdminUserPayload,
  Order,
  OrderListResponse,
  TablePayload,
} from '@table-order/shared-types';
import { EntityManager } from 'typeorm';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { SessionService } from '../../session/services/session.service';
import { TableRepository } from '../../auth/repositories/table.repository';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto';

function toDto(e: OrderEntity): Order {
  return {
    id: e.id,
    sessionId: e.sessionId,
    tableId: e.tableId,
    orderNumber: e.orderNumber,
    totalAmount: Number(e.totalAmount),
    status: e.status,
    items: (e.items ?? []).map((it) => ({
      id: it.id,
      menuId: it.menuId,
      menuName: it.menuNameSnapshot,
      unitPrice: Number(it.unitPriceSnapshot),
      quantity: it.quantity,
    })),
    createdAt: e.createdAt.toISOString(),
    canceledAt: e.canceledAt ? e.canceledAt.toISOString() : null,
  };
}

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sessions: SessionService,
    private readonly orders: OrderRepository,
    private readonly tableRepo: TableRepository,
  ) {}

  /** 현재 세션 주문 내역 (Customer) — 활성 세션 없으면 빈 배열 */
  listCurrentBySession(table: TablePayload): Promise<Order[]> {
    return this.listCurrentByTableId(table.tableId);
  }

  /** 현재 세션 주문 내역 (테이블 ID 기준 — Admin 상세/대시보드 공용) */
  async listCurrentByTableId(tableId: number): Promise<Order[]> {
    const active = await this.sessions.findActive(tableId);
    if (!active) return [];
    const rows = await this.orders.listBySession(active.id);
    return rows.map(toDto);
  }

  /**
   * 주문 상태 전이 (Admin) — 정방향만 허용.
   * 동시 편집 안전: 비관적 락(SELECT FOR UPDATE)으로 read-modify-write 직렬화 + 락 안에서 전이 재검증.
   */
  async changeStatus(
    id: number,
    next: OrderStatus,
    admin: AdminUserPayload,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.lockInStore(manager, id, admin.storeId);
      const allowed = ORDER_STATUS_FORWARD_TRANSITIONS[order.status];
      if (!allowed.includes(next)) {
        throw new BadRequestException(
          `상태를 ${order.status} → ${next} 로 변경할 수 없습니다`,
        );
      }
      order.status = next;
      if (next === OrderStatus.CANCELED) order.canceledAt = new Date();
      const saved = await manager.getRepository(OrderEntity).save(order);
      return toDto(saved);
    });
  }

  /** 주문 취소 (soft-delete, Admin) — CANCELED 전환. 비관적 락으로 동시 편집 직렬화. */
  async cancel(id: number, admin: AdminUserPayload): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.lockInStore(manager, id, admin.storeId);
      if (order.status !== OrderStatus.CANCELED) {
        order.status = OrderStatus.CANCELED;
        order.canceledAt = new Date();
        await manager.getRepository(OrderEntity).save(order);
      }
      return toDto(order);
    });
  }

  /**
   * 주문 행을 비관적 락으로 잠그고 store 소속을 검증해 반환.
   * 락은 단일 테이블(app_order)에만 적용(외부 조인 회피) — items는 별도 로드.
   */
  private async lockInStore(
    manager: EntityManager,
    id: number,
    storeId: number,
  ): Promise<OrderEntity> {
    const order = await manager.getRepository(OrderEntity).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다');
    const table = await this.tableRepo.findById(order.tableId);
    if (!table || table.storeId !== storeId) {
      throw new ForbiddenException('다른 매장의 주문입니다');
    }
    order.items = await manager
      .getRepository(OrderItemEntity)
      .find({ where: { orderId: id } });
    return order;
  }

  /** 과거 주문 이력 (Admin) — 종료된 세션 주문, 날짜 필터 + 페이지네이션 */
  async listHistoryByTable(
    tableId: number,
    opts: { from?: Date; to?: Date; page?: number; pageSize?: number },
  ): Promise<OrderListResponse> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const [rows, total] = await this.orders.listHistoryByTable(tableId, {
      from: opts.from,
      to: opts.to,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { orders: rows.map(toDto), total };
  }

  /**
   * 주문 생성 (골든 플로우).
   * - 활성 세션 보장(없으면 자동 시작) + 주문 + 주문항목을 하나의 트랜잭션으로 저장
   * - 주문항목은 메뉴 이름/단가 스냅샷을 보관 (이후 메뉴가 바뀌어도 주문 내역은 고정)
   */
  async create(dto: CreateOrderDto, table: TablePayload): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.sessions.ensureActiveSession(manager, table.tableId);

      const ids = dto.items.map((i) => i.menuId);
      const menus = await manager.getRepository(MenuEntity).find({
        where: { id: In(ids), storeId: table.storeId },
      });
      const menuMap = new Map(menus.map((m) => [m.id, m]));

      let total = 0;
      const items: OrderItemEntity[] = [];
      for (const line of dto.items) {
        const menu = menuMap.get(line.menuId);
        if (!menu || !menu.isActive) {
          throw new BadRequestException(
            `판매 중이 아닌 메뉴가 포함되어 있습니다 (menuId=${line.menuId})`,
          );
        }
        const unitPrice = Number(menu.price);
        total += unitPrice * line.quantity;
        items.push(
          manager.getRepository(OrderItemEntity).create({
            menuId: menu.id,
            menuNameSnapshot: menu.name,
            unitPriceSnapshot: unitPrice.toFixed(2),
            quantity: line.quantity,
          }),
        );
      }

      const seq =
        (await manager.getRepository(OrderEntity).count({
          where: { sessionId: session.id },
        })) + 1;
      const orderNumber = `${session.id}-${String(seq).padStart(3, '0')}`;

      const order = manager.getRepository(OrderEntity).create({
        sessionId: session.id,
        tableId: table.tableId,
        orderNumber,
        totalAmount: total.toFixed(2),
        status: OrderStatus.PENDING,
        items,
      });

      const saved = await manager.getRepository(OrderEntity).save(order);
      return toDto(saved);
    });
  }
}
