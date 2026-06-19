'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUserPayload } from '@table-order/shared-types';

interface AuthState {
  token: string | null;
  user: AdminUserPayload | null;
  expiresAt: string | null;
  setAuth(token: string, user: AdminUserPayload, expiresAt: string): void;
  clear(): void;
  isAuthenticated(): boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      expiresAt: null,
      setAuth: (token, user, expiresAt) => set({ token, user, expiresAt }),
      clear: () => set({ token: null, user: null, expiresAt: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return false;
        return Date.now() < new Date(expiresAt).getTime();
      },
    }),
    {
      name: 'admin_token',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
      }),
    },
  ),
);
