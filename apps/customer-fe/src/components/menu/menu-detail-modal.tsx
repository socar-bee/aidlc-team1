'use client';

import { useEffect } from 'react';
import type { Menu } from '@table-order/shared-types';
import { toAbsoluteImageUrl } from '@/lib/image-url';

interface Props {
  menu: Menu | null;
  onClose: () => void;
  onAddToCart?: (menu: Menu) => void;
}

export function MenuDetailModal({ menu, onClose, onAddToCart }: Props): JSX.Element | null {
  useEffect(() => {
    if (!menu) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [menu, onClose]);

  if (!menu) return null;
  const img = toAbsoluteImageUrl(menu.imageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
      data-testid="menu-detail-modal"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-slate-100">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={menu.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">
              이미지 없음
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow"
            data-testid="menu-detail-close"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 p-5">
          <h2 className="text-xl font-semibold" data-testid="menu-detail-name">
            {menu.name}
          </h2>
          <p className="text-lg font-bold text-blue-600" data-testid="menu-detail-price">
            ₩{menu.price.toLocaleString('ko-KR')}
          </p>
          {menu.description && (
            <p className="text-sm leading-relaxed text-slate-600" data-testid="menu-detail-description">
              {menu.description}
            </p>
          )}
          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(menu)}
              className="min-h-touch w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white"
              data-testid="menu-detail-add-to-cart"
            >
              장바구니 담기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
