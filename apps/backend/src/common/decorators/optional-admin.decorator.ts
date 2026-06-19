import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AdminUserPayload } from '@table-order/shared-types';

/** OptionalAuthGuard 와 함께 사용 — Admin 토큰이 있으면 payload, 없으면 null */
export const OptionalAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUserPayload | null => {
    const request = ctx.switchToHttp().getRequest<{ admin?: AdminUserPayload }>();
    return request.admin ?? null;
  },
);
