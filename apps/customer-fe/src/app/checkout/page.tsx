'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useCreateOrder } from '@/lib/queries/order';
import { OrderSuccess } from '@/components/order/order-success';
import { ApiError } from '@/lib/api-client';

export default function CheckoutPage(): JSX.Element | null {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clear = useCartStore((s) => s.clear);
  const mutation = useCreateOrder();

  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // 주문 성공 전(=확정 안 한 상태)에 장바구니가 비면 메뉴로 복귀
  useEffect(() => {
    if (orderNumber === null && items.length === 0) {
      router.replace('/');
    }
  }, [orderNumber, items.length, router]);

  if (orderNumber) {
    return <OrderSuccess orderNumber={orderNumber} />;
  }
  if (items.length === 0) {
    return null;
  }

  const onConfirm = (): void => {
    mutation.mutate(
      { items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })) },
      {
        onSuccess: (order) => {
          setOrderNumber(order.orderNumber);
          clear(); // 성공 시에만 장바구니 비움 (실패 시 유지)
        },
      },
    );
  };

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : '주문 처리 중 오류가 발생했습니다. 다시 시도해 주세요'
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" data-testid="checkout-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-slate-700"
          data-testid="checkout-back"
        >
          ← 뒤로
        </button>
        <h1 className="text-base font-semibold">주문 확인</h1>
        <span className="w-10" />
      </header>

      <div className="flex-1 px-4 py-3">
        <ul className="divide-y divide-slate-100 rounded-lg bg-white">
          {items.map((it) => (
            <li
              key={it.menuId}
              className="flex items-center justify-between px-4 py-3"
              data-testid="checkout-item"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{it.name}</p>
                <p className="text-xs text-slate-400">
                  ₩{it.unitPrice.toLocaleString('ko-KR')} × {it.quantity}
                </p>
              </div>
              <span className="ml-3 shrink-0 text-sm font-semibold text-slate-700">
                ₩{(it.unitPrice * it.quantity).toLocaleString('ko-KR')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {errorMessage && (
        <p
          className="mx-4 mb-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600"
          data-testid="checkout-error"
        >
          {errorMessage}
        </p>
      )}

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4 pb-safe">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base text-slate-600">총 금액</span>
          <span className="text-2xl font-bold text-blue-600" data-testid="checkout-total">
            ₩{total.toLocaleString('ko-KR')}
          </span>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={mutation.isPending}
          className="min-h-touch w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
          data-testid="checkout-confirm"
        >
          {mutation.isPending ? '주문 처리 중…' : '주문 확정하기'}
        </button>
      </footer>
    </div>
  );
}
