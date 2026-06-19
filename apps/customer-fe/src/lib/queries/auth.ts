'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  TableSetupRequest,
  TableSetupResponse,
} from '@table-order/shared-types';
import { apiFetch } from '../api-client';

export interface CombinedSetupInput extends AdminLoginRequest, TableSetupRequest {}

/**
 * Customer-side setup: admin 인증 + table 등록을 한 번에 처리.
 * PoC 단순화 — 후속에는 분리(또는 Admin FE에서 등록 → QR)로 전환 가능.
 */
export function useCombinedTableSetup() {
  return useMutation<TableSetupResponse, Error, CombinedSetupInput>({
    mutationFn: async (input) => {
      const adminRes = await apiFetch<AdminLoginResponse>('/auth/admin/login', {
        method: 'POST',
        body: {
          storeCode: input.storeCode,
          username: input.username,
          password: input.password,
        },
      });
      const tableRes = await apiFetch<TableSetupResponse>('/auth/table/setup', {
        method: 'POST',
        getToken: () => adminRes.accessToken,
        body: {
          tableNumber: input.tableNumber,
          password: input.password,
        },
      });
      return tableRes;
    },
  });
}
