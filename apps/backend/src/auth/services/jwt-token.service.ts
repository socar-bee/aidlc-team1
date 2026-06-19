import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { AdminUserPayload, TablePayload } from '@table-order/shared-types';
import { jwtConfig } from '../../config/jwt.config';

type TokenType = 'admin' | 'table';

interface AdminClaims extends AdminUserPayload {
  type: 'admin';
}

interface TableClaims extends TablePayload {
  type: 'table';
}

@Injectable()
export class JwtTokenService {
  private cfg = jwtConfig();

  signAdmin(payload: AdminUserPayload): { token: string; expiresAt: Date } {
    const claims: AdminClaims = { ...payload, type: 'admin' };
    const token = jwt.sign(claims, this.cfg.secret, {
      algorithm: 'HS256',
      expiresIn: this.cfg.adminExpiresIn,
    } as jwt.SignOptions);
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
    return { token, expiresAt };
  }

  signTable(payload: TablePayload): { token: string; expiresAt: Date } {
    const claims: TableClaims = { ...payload, type: 'table' };
    const token = jwt.sign(claims, this.cfg.secret, {
      algorithm: 'HS256',
      expiresIn: this.cfg.tableExpiresIn,
    } as jwt.SignOptions);
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
    return { token, expiresAt };
  }

  verify<T extends TokenType>(
    token: string,
    expected: T,
  ): T extends 'admin' ? AdminUserPayload : TablePayload {
    try {
      const decoded = jwt.verify(token, this.cfg.secret, {
        algorithms: ['HS256'],
      }) as AdminClaims | TableClaims;
      if (decoded.type !== expected) {
        throw new UnauthorizedException('Invalid token type');
      }
      const { type: _ignored, ...payload } = decoded;
      return payload as never;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
