'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@table-order/shared-types';
import { authFetch } from '../auth-fetch';

const KEY = ['categories'] as const;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: KEY,
    queryFn: () => authFetch<Category[]>('/categories'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, Error, CreateCategoryRequest>({
    mutationFn: (input) =>
      authFetch<Category>('/categories', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, Error, { id: number; dto: UpdateCategoryRequest }>({
    mutationFn: ({ id, dto }) =>
      authFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: dto }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => authFetch<void>(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation<Category[], Error, number[]>({
    mutationFn: (orderedIds) =>
      authFetch<Category[]>('/categories/reorder', {
        method: 'PATCH',
        body: { orderedIds },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
