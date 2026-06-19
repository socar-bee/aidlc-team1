'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateMenuRequest,
  Menu,
  UpdateMenuRequest,
} from '@table-order/shared-types';
import { authFetch } from '../auth-fetch';

const KEY = ['menus'] as const;

export function useMenus(filter?: { categoryId?: number }) {
  return useQuery<Menu[]>({
    queryKey: [...KEY, filter?.categoryId ?? 'all'],
    queryFn: () => {
      const qs = filter?.categoryId !== undefined ? `?categoryId=${filter.categoryId}` : '';
      return authFetch<Menu[]>(`/menus${qs}`);
    },
  });
}

export function useCreateMenu() {
  const qc = useQueryClient();
  return useMutation<Menu, Error, CreateMenuRequest>({
    mutationFn: (input) => authFetch<Menu>('/menus', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMenu() {
  const qc = useQueryClient();
  return useMutation<Menu, Error, { id: number; dto: UpdateMenuRequest }>({
    mutationFn: ({ id, dto }) =>
      authFetch<Menu>(`/menus/${id}`, { method: 'PATCH', body: dto }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => authFetch<void>(`/menus/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReorderMenus() {
  const qc = useQueryClient();
  return useMutation<Menu[], Error, { categoryId: number; orderedIds: number[] }>({
    mutationFn: (input) =>
      authFetch<Menu[]>('/menus/reorder', { method: 'PATCH', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
