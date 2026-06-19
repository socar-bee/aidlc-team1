import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * 선택적 인증 — 공개/Admin/Customer 공용 read 엔드포인트용.
 * Bearer 토큰이 있으면 Admin 또는 Table 토큰으로 검증해 req.admin / req.table 에 주입.
 * 토큰이 없거나 무효여도 throw 하지 않고 통과(익명 → getCurrent() fallback).
 * 컨트롤러는 @OptionalAdmin()/@OptionalTable() 로 payload 를 받아 storeId 를 결정한다.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { admin?: unknown; table?: unknown }>();
    const header = req.headers.authorization ?? '';
    const m = /^Bearer\s+(.+)$/i.exec(header);
    if (!m) return true;
    const token = m[1]!;
    try {
      req.admin = this.authService.validateAdminToken(token);
      return true;
    } catch {
      /* try table */
    }
    try {
      req.table = this.authService.validateTableToken(token);
    } catch {
      /* 무효 토큰 → 익명으로 통과 */
    }
    return true;
  }
}
