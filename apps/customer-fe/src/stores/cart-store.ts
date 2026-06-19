'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Menu } from '@table-order/shared-types';

export interface CartItem {
  menuId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

const MAX_QTY = 99;
const MIN_QTY = 1;

interface CartState {
  items: CartItem[];
  add(menu: Pick<Menu, 'id' | 'name' | 'price'>, quantity?: number): void;
  remove(menuId: number): void;
  setQuantity(menuId: number, qty: number): void;
  inc(menuId: number): void;
  dec(menuId: number): void;
  clear(): void;
  total(): number;
  count(): number;
}

const clamp = (q: number): number => Math.max(MIN_QTY, Math.min(MAX_QTY, Math.floor(q)));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (menu, quantity = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.menuId === menu.id);
          if (idx >= 0) {
            const items = [...state.items];
            const cur = items[idx]!;
            items[idx] = { ...cur, quantity: clamp(cur.quantity + quantity) };
            return { items };
          }
          return {
            items: [
              ...state.items,
              {
                menuId: menu.id,
                name: menu.name,
                unitPrice: menu.price,
                quantity: clamp(quantity),
              },
            ],
          };
        }),

      remove: (menuId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuId !== menuId) })),

      setQuantity: (menuId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.menuId !== menuId) };
          }
          const idx = state.items.findIndex((i) => i.menuId === menuId);
          if (idx < 0) return state;
          const items = [...state.items];
          items[idx] = { ...items[idx]!, quantity: clamp(qty) };
          return { items };
        }),

      inc: (menuId) => {
        const cur = get().items.find((i) => i.menuId === menuId);
        if (!cur) return;
        get().setQuantity(menuId, cur.quantity + 1);
      },

      dec: (menuId) => {
        const cur = get().items.find((i) => i.menuId === menuId);
        if (!cur) return;
        if (cur.quantity <= 1) {
          get().remove(menuId);
        } else {
          get().setQuantity(menuId, cur.quantity - 1);
        }
      },

      clear: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.clear();
        }
      },
    },
  ),
);
