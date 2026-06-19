import { UnauthorizedException } from '@nestjs/common';
import type { AdminUserPayload, TablePayload } from '@table-order/shared-types';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService (인증 토큰 발급)', () => {
  const service = new JwtTokenService();
  const admin: AdminUserPayload = { id: 1, storeId: 7, username: 'admin' };
  const table: TablePayload = { tableId: 3, storeId: 7, tableNumber: 1 };

  it('admin 토큰 발급 후 검증하면 동일 payload 를 복원한다', () => {
    const { token, expiresAt } = service.signAdmin(admin);
    expect(typeof token).toBe('string');
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const decoded = service.verify(token, 'admin');
    expect(decoded).toMatchObject(admin);
  });

  it('table 토큰 발급 후 검증하면 동일 payload 를 복원한다', () => {
    const { token } = service.signTable(table);
    expect(service.verify(token, 'table')).toMatchObject(table);
  });

  it('토큰 타입이 기대와 다르면 거부한다 (admin 토큰을 table 로 검증)', () => {
    const { token } = service.signAdmin(admin);
    expect(() => service.verify(token, 'table')).toThrow(UnauthorizedException);
  });

  it('변조된 토큰은 거부한다', () => {
    const { token } = service.signAdmin(admin);
    const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'bb' : 'aa');
    expect(() => service.verify(tampered, 'admin')).toThrow(UnauthorizedException);
  });
});
