import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { TablePayload } from '@table-order/shared-types';

/** OptionalAuthGuard 와 함께 사용 — Table 토큰이 있으면 payload, 없으면 null */
export const OptionalTable = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TablePayload | null => {
    const request = ctx.switchToHttp().getRequest<{ table?: TablePayload }>();
    return request.table ?? null;
  },
);
