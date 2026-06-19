'use client';

import { OrderStatus } from '@table-order/shared-types';

const MAP: Record<OrderStatus, { text: string; cls: string }> = {
  [OrderStatus.PENDING]: { text: '대기중', cls: 'bg-amber-100 text-amber-700' },
  [OrderStatus.PREPARING]: { text: '준비중', cls: 'bg-blue-100 text-blue-700' },
  [OrderStatus.COMPLETED]: { text: '완료', cls: 'bg-green-100 text-green-700' },
  [OrderStatus.CANCELED]: { text: '취소', cls: 'bg-slate-100 text-slate-500' },
};

export function StatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  const m = MAP[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}>{m.text}</span>
  );
}
