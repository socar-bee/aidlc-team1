'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { CartItemRow } from '@/components/cart/cart-item-row';

export default function CartPage(): JSX.Element {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clear = useCartStore((s) => s.clear);

  const onClear = (): void => {
    if (!window.confirm('장바구니를 비우시겠습니까?')) return;
    clear();
  };

  const onCheckout = (): void => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-base text-slate-500" data-testid="cart-empty">
          장바구니가 비어 있습니다
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 min-h-touch rounded-md border border-slate-300 px-5 py-2 text-sm"
          data-testid="cart-back-to-menu"
        >
          메뉴로 돌아가기
        </button>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" data-testid="cart-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-slate-700"
          data-testid="cart-back"
        >
          ← 뒤로
        </button>
        <h1 className="text-base font-semibold">장바구니</h1>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-500"
          data-testid="cart-clear"
        >
          비우기
        </button>
      </header>

      <div className="flex-1">
        {items.map((it) => (
          <CartItemRow key={it.menuId} item={it} />
        ))}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4 pb-safe">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base text-slate-600">총 금액</span>
          <span className="text-2xl font-bold text-blue-600" data-testid="cart-total">
            ₩{total.toLocaleString('ko-KR')}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="min-h-touch w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white"
          data-testid="cart-checkout"
        >
          주문하기
        </button>
      </footer>
    </div>
  );
}
