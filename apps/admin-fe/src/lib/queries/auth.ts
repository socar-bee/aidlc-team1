'use client';

import { useMutation } from '@tanstack/react-query';
import type { AdminLoginRequest, AdminLoginResponse } from '@table-order/shared-types';
import { apiFetch } from '../api-client';

export function useAdminLogin() {
  return useMutation<AdminLoginResponse, Error, AdminLoginRequest>({
    mutationFn: (input) =>
      apiFetch<AdminLoginResponse>('/auth/admin/login', {
        method: 'POST',
        body: input,
      }),
  });
}
