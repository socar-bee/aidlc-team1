'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderListResponse, TableSession } from '@table-order/shared-types';
import { authFetch } from '../auth-fetch';

export interface TableHistoryFilter {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(filter: TableHistoryFilter): string {
  const params = new URLSearchParams();
  if (filter.from) params.set('from', filter.from);
  if (filter.to) params.set('to', filter.to);
  if (filter.page) params.set('page', String(filter.page));
  if (filter.pageSize) params.set('pageSize', String(filter.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useTableHistory(tableId: number, filter: TableHistoryFilter) {
  return useQuery<OrderListResponse>({
    queryKey: ['table-history', tableId, filter],
    queryFn: () =>
      authFetch<OrderListResponse>(`/tables/${tableId}/history${buildQuery(filter)}`),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation<TableSession, Error, number>({
    mutationFn: (tableId) =>
      authFetch<TableSession>(`/tables/${tableId}/end-session`, { method: 'POST' }),
    onSuccess: (_data, tableId) => {
      qc.invalidateQueries({ queryKey: ['table-history', tableId] });
    },
  });
}
