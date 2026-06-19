'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';

export function FloatingCartButton(): JSX.Element | null {
  const router = useRouter();
  const count = useCartStore((s) => s.count());
  const total = useCartStore((s) => s.total());

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={() => router.push('/cart')}
      className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 min-h-touch flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg"
      data-testid="floating-cart-button"
    >
      <span className="grid h-7 min-w-[28px] place-items-center rounded-full bg-white px-2 text-sm font-bold text-blue-600" data-testid="floating-cart-count">
        {count}
      </span>
      <span>장바구니</span>
      <span data-testid="floating-cart-total">₩{total.toLocaleString('ko-KR')}</span>
    </button>
  );
}
