'use client';

import { useCartStore, type CartItem } from '@/stores/cart-store';

interface Props {
  item: CartItem;
}

export function CartItemRow({ item }: Props): JSX.Element {
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);

  const subtotal = item.unitPrice * item.quantity;

  return (
    <div
      className="flex items-center gap-3 border-b border-slate-200 px-4 py-3"
      data-testid={`cart-item-${item.menuId}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-slate-900 line-clamp-1">{item.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          단가 ₩{item.unitPrice.toLocaleString('ko-KR')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => dec(item.menuId)}
          className="min-h-touch min-w-touch grid place-items-center rounded-full border border-slate-300 text-lg"
          data-testid={`cart-dec-${item.menuId}`}
          aria-label="수량 감소"
        >
          −
        </button>
        <span
          className="min-w-[2rem] text-center text-base font-semibold"
          data-testid={`cart-qty-${item.menuId}`}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => inc(item.menuId)}
          className="min-h-touch min-w-touch grid place-items-center rounded-full border border-slate-300 text-lg"
          data-testid={`cart-inc-${item.menuId}`}
          aria-label="수량 증가"
        >
          ＋
        </button>
      </div>

      <div className="ml-3 w-24 text-right">
        <p className="text-base font-semibold text-blue-600" data-testid={`cart-subtotal-${item.menuId}`}>
          ₩{subtotal.toLocaleString('ko-KR')}
        </p>
        <button
          type="button"
          onClick={() => remove(item.menuId)}
          className="mt-1 text-xs text-red-500 underline"
          data-testid={`cart-remove-${item.menuId}`}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
