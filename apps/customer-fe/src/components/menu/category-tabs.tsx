'use client';

import type { Category } from '@table-order/shared-types';

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: Props): JSX.Element {
  return (
    <nav
      className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-3"
      data-testid="category-tabs"
    >
      {categories.map((c) => {
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`min-h-touch min-w-touch whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            data-testid={`category-tab-${c.id}`}
            aria-pressed={active}
          >
            {c.name}
          </button>
        );
      })}
    </nav>
  );
}
