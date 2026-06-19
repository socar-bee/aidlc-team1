'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { CreateOrderRequest, Order } from '@table-order/shared-types';
import { apiFetch } from '../api-client';
import { getTableToken } from '../auth';

export function useCreateOrder() {
  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: (input) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: input,
        getToken: getTableToken,
      }),
  });
}

/** 현재 세션 주문 내역 (최신순, CANCELED·이전 세션 제외 — 서버 필터). 2초 폴링으로 상태 갱신 */
export function useCurrentOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders', 'current'],
    queryFn: () => apiFetch<Order[]>('/orders/current', { getToken: getTableToken }),
    refetchInterval: 2000,
  });
}
