'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Order,
  OrderStatus,
  TableSetupResponse,
  TableSummary,
} from '@table-order/shared-types';
import { authFetch } from '../auth-fetch';

const POLL_INTERVAL = 2000;

export function useDashboard() {
  return useQuery<TableSummary[]>({
    queryKey: ['dashboard'],
    queryFn: () => authFetch<TableSummary[]>('/tables/summary'),
    refetchInterval: POLL_INTERVAL,
  });
}

export function useTables() {
  return useQuery<Array<{ id: number; tableNumber: number }>>({
    queryKey: ['tables'],
    queryFn: () => authFetch<Array<{ id: number; tableNumber: number }>>('/tables'),
  });
}

export function useTableCurrentOrders(tableId: number | null) {
  return useQuery<Order[]>({
    queryKey: ['table-current', tableId],
    queryFn: () => authFetch<Order[]>(`/tables/${tableId}/current-orders`),
    enabled: tableId !== null,
    refetchInterval: POLL_INTERVAL,
  });
}

function invalidateDashboard(qc: ReturnType<typeof useQueryClient>): void {
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['table-current'] });
}

export function useChangeOrderStatus() {
  const qc = useQueryClient();
  return useMutation<Order, Error, { id: number; next: OrderStatus }>({
    mutationFn: ({ id, next }) =>
      authFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { next } }),
    onSuccess: () => invalidateDashboard(qc),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation<Order, Error, number>({
    mutationFn: (id) => authFetch<Order>(`/orders/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateDashboard(qc),
  });
}

export function useRegisterTable() {
  const qc = useQueryClient();
  return useMutation<TableSetupResponse, Error, { tableNumber: number; password: string }>({
    mutationFn: (body) =>
      authFetch<TableSetupResponse>('/auth/table/setup', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
