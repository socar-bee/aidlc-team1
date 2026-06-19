import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TableSessionEntity } from '../entities/table-session.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(TableSessionEntity)
    private readonly repo: Repository<TableSessionEntity>,
  ) {}

  /** 종료되지 않은(활성) 세션 — 없으면 null */
  findActive(tableId: number): Promise<TableSessionEntity | null> {
    return this.repo.findOne({
      where: { tableId, endedAt: IsNull() },
      order: { id: 'DESC' },
    });
  }

  save(entity: TableSessionEntity): Promise<TableSessionEntity> {
    return this.repo.save(entity);
  }
}
