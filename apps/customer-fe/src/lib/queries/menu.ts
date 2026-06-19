'use client';

import { useQuery } from '@tanstack/react-query';
import type { Category, Menu } from '@table-order/shared-types';
import { apiFetch } from '../api-client';
import { getTableToken } from '../auth';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/categories', { getToken: getTableToken }),
    staleTime: 60_000,
  });
}

export function useMenusByCategory(categoryId: number | null) {
  return useQuery<Menu[]>({
    queryKey: ['menus', 'by-category', categoryId],
    queryFn: () =>
      apiFetch<Menu[]>(`/menus/by-category/${categoryId}`, { getToken: getTableToken }),
    enabled: categoryId !== null,
    staleTime: 30_000,
  });
}
