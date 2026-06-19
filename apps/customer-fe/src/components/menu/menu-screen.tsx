'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Menu } from '@table-order/shared-types';
import { useCategories, useMenusByCategory } from '@/lib/queries/menu';
import { useCartStore } from '@/stores/cart-store';
import { CategoryTabs } from './category-tabs';
import { MenuCard } from './menu-card';
import { MenuDetailModal } from './menu-detail-modal';
import { FloatingCartButton } from '@/components/cart/floating-cart-button';

export function MenuScreen(): JSX.Element {
  const categories = useCategories();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Menu | null>(null);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    if (selectedId === null && categories.data && categories.data.length > 0) {
      setSelectedId(categories.data[0]!.id);
    }
  }, [categories.data, selectedId]);

  const menus = useMenusByCategory(selectedId);
  const isLoading = categories.isLoading || (selectedId !== null && menus.isLoading);

  const empty = useMemo(
    () => !isLoading && (categories.data?.length === 0 || menus.data?.length === 0),
    [isLoading, categories.data, menus.data],
  );

  const handleAddToCart = (m: Menu): void => {
    addToCart({ id: m.id, name: m.name, price: m.price });
    setDetail(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white px-4 py-3">
        <h1 className="text-base font-bold text-slate-800">메뉴</h1>
        <Link
          href="/history"
          className="text-sm font-medium text-blue-600"
          data-testid="nav-history"
        >
          주문 내역
        </Link>
      </header>

      <CategoryTabs
        categories={categories.data ?? []}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <main className="px-3 py-4 pb-32">
        {isLoading && (
          <p className="py-12 text-center text-sm text-slate-400" data-testid="menu-loading">
            메뉴를 불러오는 중...
          </p>
        )}

        {empty && categories.data?.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">등록된 카테고리가 없습니다</p>
        )}

        {empty && (categories.data?.length ?? 0) > 0 && (
          <p className="py-12 text-center text-sm text-slate-400">이 카테고리에 메뉴가 없습니다</p>
        )}

        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="menu-grid"
        >
          {menus.data?.map((m) => (
            <MenuCard key={m.id} menu={m} onSelect={setDetail} />
          ))}
        </div>
      </main>

      <MenuDetailModal
        menu={detail}
        onClose={() => setDetail(null)}
        onAddToCart={handleAddToCart}
      />
      <FloatingCartButton />
    </div>
  );
}
