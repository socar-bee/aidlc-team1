import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, IsNull } from 'typeorm';
import type { TableSession } from '@table-order/shared-types';
import { TableSessionEntity } from '../entities/table-session.entity';
import { SessionRepository } from '../repositories/session.repository';

function toDto(e: TableSessionEntity): TableSession {
  return {
    id: e.id,
    tableId: e.tableId,
    startedAt: e.startedAt.toISOString(),
    endedAt: e.endedAt ? e.endedAt.toISOString() : null,
  };
}

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepo: SessionRepository) {}

  /** 활성 세션 조회 (읽기 전용) */
  async findActive(tableId: number): Promise<TableSession | null> {
    const row = await this.sessionRepo.findActive(tableId);
    return row ? toDto(row) : null;
  }

  /**
   * 활성 세션 보장 — 트랜잭션 manager 안에서 실행되어 주문 생성과 원자적으로 처리된다.
   * 활성 세션이 있으면 그대로 반환, 없으면 새 세션을 시작한다.
   */
  async ensureActiveSession(
    manager: EntityManager,
    tableId: number,
  ): Promise<TableSessionEntity> {
    const repo = manager.getRepository(TableSessionEntity);
    const existing = await repo.findOne({
      where: { tableId, endedAt: IsNull() },
      order: { id: 'DESC' },
    });
    if (existing) return existing;
    return repo.save(repo.create({ tableId }));
  }

  /**
   * 세션 종료 (Admin "이용 완료") — endedAt 기록.
   * 진행 중 주문이 있어도 강제 종료. 활성 세션이 없으면 404.
   * 종료 후 해당 세션 주문은 '현재' 조회에서 자동 제외(endedAt IS NULL 기준).
   */
  async end(tableId: number): Promise<TableSession> {
    const active = await this.sessionRepo.findActive(tableId);
    if (!active) throw new NotFoundException('활성 세션이 없습니다');
    active.endedAt = new Date();
    const saved = await this.sessionRepo.save(active);
    return toDto(saved);
  }
}
