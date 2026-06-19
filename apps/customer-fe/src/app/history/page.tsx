'use client';

import { useRouter } from 'next/navigation';
import { OrderStatus } from '@table-order/shared-types';
import type { Order } from '@table-order/shared-types';
import { useCurrentOrders } from '@/lib/queries/order';

const STATUS_LABEL: Record<OrderStatus, { text: string; cls: string }> = {
  [OrderStatus.PENDING]: { text: '대기중', cls: 'bg-amber-100 text-amber-700' },
  [OrderStatus.PREPARING]: { text: '준비중', cls: 'bg-blue-100 text-blue-700' },
  [OrderStatus.COMPLETED]: { text: '완료', cls: 'bg-green-100 text-green-700' },
  [OrderStatus.CANCELED]: { text: '취소', cls: 'bg-slate-100 text-slate-500' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderCard({ order }: { order: Order }): JSX.Element {
  const label = STATUS_LABEL[order.status];
  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-4"
      data-testid="history-order"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-800">
            주문 {order.orderNumber}
          </span>
          <span className="ml-2 text-xs text-slate-400">{formatTime(order.createdAt)}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${label.cls}`}>
          {label.text}
        </span>
      </div>
      <ul className="space-y-1">
        {order.items.map((it) => (
          <li key={it.id ?? it.menuId} className="flex justify-between text-sm text-slate-600">
            <span>
              {it.menuName} × {it.quantity}
            </span>
            <span>₩{(it.unitPrice * it.quantity).toLocaleString('ko-KR')}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-2">
        <span className="text-sm text-slate-500">합계</span>
        <span className="text-base font-bold text-blue-600">
          ₩{order.totalAmount.toLocaleString('ko-KR')}
        </span>
      </div>
    </article>
  );
}

export default function HistoryPage(): JSX.Element {
  const router = useRouter();
  // 2초 폴링으로 상태 변경/취소/세션 종료를 주기적 반영 (US-C-25)
  const { data, isLoading, isError } = useCurrentOrders();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" data-testid="history-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-sm text-slate-700"
          data-testid="history-back"
        >
          ← 메뉴
        </button>
        <h1 className="text-base font-semibold">주문 내역</h1>
        <span className="w-10" />
      </header>

      <main className="flex-1 space-y-3 px-4 py-4">
        {isLoading && (
          <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>
        )}
        {isError && (
          <p className="py-12 text-center text-sm text-red-500">주문 내역을 불러오지 못했습니다</p>
        )}
        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <p className="py-12 text-center text-sm text-slate-400" data-testid="history-empty">
            아직 주문 내역이 없습니다
          </p>
        )}
        {data?.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </main>
    </div>
  );
}
