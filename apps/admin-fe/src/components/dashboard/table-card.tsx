'use client';

import type { TableSummary } from '@table-order/shared-types';

interface Props {
  summary: TableSummary;
  highlighted: boolean;
  onClick: () => void;
}

export function TableCard({ summary, highlighted, onClick }: Props): JSX.Element {
  const hasOrders = summary.recentOrderPreviews.length > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-44 flex-col rounded-xl border bg-white p-4 text-left transition ${
        highlighted
          ? 'border-blue-400 ring-2 ring-blue-300 animate-pulse'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      data-testid={`table-card-${summary.tableId}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-slate-800">
          테이블 {summary.tableNumber}
        </span>
        <span className="text-sm font-semibold text-blue-600">
          ₩{summary.totalAmount.toLocaleString('ko-KR')}
        </span>
      </div>

      <div className="mt-3 flex-1 space-y-1 overflow-hidden">
        {hasOrders ? (
          summary.recentOrderPreviews.map((p) => (
            <p key={p.orderNumber} className="truncate text-xs text-slate-500">
              <span className="font-medium text-slate-600">{p.orderNumber}</span>{' '}
              {p.itemsSummary}
            </p>
          ))
        ) : (
          <p className="text-xs text-slate-300">주문 없음</p>
        )}
      </div>

      <span className="mt-2 text-xs text-slate-400">
        {summary.activeSessionId ? '이용 중' : '빈 테이블'}
      </span>
    </button>
  );
}
