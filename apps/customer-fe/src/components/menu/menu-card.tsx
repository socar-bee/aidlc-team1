'use client';

import type { Menu } from '@table-order/shared-types';
import { toAbsoluteImageUrl } from '@/lib/image-url';

interface Props {
  menu: Menu;
  onSelect: (menu: Menu) => void;
}

export function MenuCard({ menu, onSelect }: Props): JSX.Element {
  const img = toAbsoluteImageUrl(menu.imageUrl);
  return (
    <button
      type="button"
      onClick={() => onSelect(menu)}
      className="min-h-touch group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
      data-testid={`menu-card-${menu.id}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={menu.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
            이미지 없음
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{menu.name}</h3>
        {menu.description && (
          <p className="text-xs text-slate-500 line-clamp-2" data-testid={`menu-card-desc-${menu.id}`}>
            {menu.description}
          </p>
        )}
        <p className="mt-1 text-base font-semibold text-blue-600" data-testid={`menu-card-price-${menu.id}`}>
          ₩{menu.price.toLocaleString('ko-KR')}
        </p>
      </div>
    </button>
  );
}
