import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { TablePayload } from '@table-order/shared-types';

export const CurrentTable = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TablePayload => {
    const request = ctx.switchToHttp().getRequest<{ table?: TablePayload }>();
    if (!request.table) {
      throw new Error('CurrentTable used without TableTokenGuard');
    }
    return request.table;
  },
);
