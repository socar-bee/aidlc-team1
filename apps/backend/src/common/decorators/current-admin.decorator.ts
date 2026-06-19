import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AdminUserPayload } from '@table-order/shared-types';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ admin?: AdminUserPayload }>();
    if (!request.admin) {
      throw new Error('CurrentAdmin used without JwtAdminGuard');
    }
    return request.admin;
  },
);
