import { NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { SessionService } from './session.service';
import { SessionRepository } from '../repositories/session.repository';
import { TableSessionEntity } from '../entities/table-session.entity';

function activeSession(): TableSessionEntity {
  const e = new TableSessionEntity();
  e.id = 1;
  e.tableId = 3;
  e.startedAt = new Date('2026-06-19T10:00:00Z');
  e.endedAt = null;
  return e;
}

describe('SessionService (세션 상태 전이)', () => {
  let repo: jest.Mocked<SessionRepository>;
  let service: SessionService;

  beforeEach(() => {
    repo = createMock<SessionRepository>();
    service = new SessionService(repo);
  });

  describe('findActive', () => {
    it('활성 세션이 없으면 null', async () => {
      repo.findActive.mockResolvedValue(null);
      expect(await service.findActive(3)).toBeNull();
    });

    it('활성 세션이 있으면 DTO 로 매핑 (endedAt=null)', async () => {
      repo.findActive.mockResolvedValue(activeSession());
      const dto = await service.findActive(3);
      expect(dto).toMatchObject({ id: 1, tableId: 3, endedAt: null });
    });
  });

  describe('end (이용 완료 → 종료)', () => {
    it('활성 세션이 없으면 NotFoundException', async () => {
      repo.findActive.mockResolvedValue(null);
      await expect(service.end(3)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('활성 세션을 종료하면 endedAt 이 기록되고 저장된다', async () => {
      const active = activeSession();
      repo.findActive.mockResolvedValue(active);
      repo.save.mockImplementation(async (e) => e);

      const dto = await service.end(3);

      expect(active.endedAt).toBeInstanceOf(Date);
      expect(repo.save).toHaveBeenCalledWith(active);
      expect(dto.endedAt).not.toBeNull();
    });
  });
});
