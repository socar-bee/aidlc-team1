'use client';

import { useAuthStore } from '@/stores/auth-store';
import { apiFetch, ApiClientOptions } from './api-client';

export function authFetch<T>(path: string, opts: ApiClientOptions = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...opts,
    getToken: () => useAuthStore.getState().token,
  });
}
