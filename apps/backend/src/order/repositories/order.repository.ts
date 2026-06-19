import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { OrderStatus } from '@table-order/shared-types';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  /** 현재 세션 주문 — CANCELED 제외, 최신순 */
  listBySession(sessionId: number): Promise<OrderEntity[]> {
    return this.repo.find({
      where: { sessionId, status: Not(OrderStatus.CANCELED) },
      relations: { items: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  /** 과거 이력 — 종료된 세션의 주문만, 날짜 범위 + 페이지네이션, 최신순 */
  listHistoryByTable(
    tableId: number,
    opts: { from?: Date; to?: Date; skip: number; take: number },
  ): Promise<[OrderEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('o')
      .innerJoin('o.session', 's')
      .leftJoinAndSelect('o.items', 'it')
      .where('o.tableId = :tableId', { tableId })
      .andWhere('s.endedAt IS NOT NULL');
    if (opts.from) qb.andWhere('o.createdAt >= :from', { from: opts.from });
    if (opts.to) qb.andWhere('o.createdAt <= :to', { to: opts.to });
    qb.orderBy('o.createdAt', 'DESC')
      .addOrderBy('o.id', 'DESC')
      .addOrderBy('it.id', 'ASC')
      .skip(opts.skip)
      .take(opts.take);
    return qb.getManyAndCount();
  }
}
