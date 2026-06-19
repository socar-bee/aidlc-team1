'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderStatus } from '@table-order/shared-types';
import type { Order } from '@table-order/shared-types';
import { useTableHistory, type TableHistoryFilter } from '@/lib/queries/table';
import { EndSessionButton } from '@/components/table/end-session-button';

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '대기중',
  [OrderStatus.PREPARING]: '준비중',
  [OrderStatus.COMPLETED]: '완료',
  [OrderStatus.CANCELED]: '취소',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TableHistoryPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const tableId = Number(params.id);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState<{ from?: string; to?: string }>({});
  const [page, setPage] = useState(1);

  const filter: TableHistoryFilter = useMemo(
    () => ({
      from: applied.from ? new Date(applied.from).toISOString() : undefined,
      // 종료일은 해당 일자 끝(23:59:59)까지 포함
      to: applied.to ? new Date(`${applied.to}T23:59:59`).toISOString() : undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [applied, page],
  );

  const { data, isLoading, isError } = useTableHistory(tableId, filter);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFilter = (): void => {
    setApplied({ from: from || undefined, to: to || undefined });
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" data-testid="admin-history">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">테이블 {tableId} 과거 주문 내역</h1>
        <EndSessionButton tableId={tableId} />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-md border border-slate-200 bg-white p-3">
        <label className="flex flex-col text-xs text-slate-500">
          시작일
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-2 py-1 text-sm"
            data-testid="history-from"
          />
        </label>
        <label className="flex flex-col text-xs text-slate-500">
          종료일
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-2 py-1 text-sm"
            data-testid="history-to"
          />
        </label>
        <button
          type="button"
          onClick={applyFilter}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          data-testid="history-apply"
        >
          적용
        </button>
      </div>

      {isLoading && <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>}
      {isError && (
        <p className="py-12 text-center text-sm text-red-500">내역을 불러오지 못했습니다</p>
      )}
      {!isLoading && !isError && total === 0 && (
        <p className="py-12 text-center text-sm text-slate-400" data-testid="history-empty">
          해당 조건의 과거 주문이 없습니다
        </p>
      )}

      <div className="space-y-2">
        {data?.orders.map((o: Order) => (
          <article
            key={o.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
            data-testid="admin-history-order"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">주문 {o.orderNumber}</span>
              <span className="text-xs text-slate-400">{formatTime(o.createdAt)}</span>
            </div>
            <ul className="space-y-1">
              {o.items.map((it) => (
                <li
                  key={it.id ?? it.menuId}
                  className="flex justify-between text-sm text-slate-600"
                >
                  <span>
                    {it.menuName} × {it.quantity}
                  </span>
                  <span>₩{(it.unitPrice * it.quantity).toLocaleString('ko-KR')}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-xs text-slate-400">{STATUS_LABEL[o.status]}</span>
              <span className="text-base font-bold text-blue-600">
                ₩{o.totalAmount.toLocaleString('ko-KR')}
              </span>
            </div>
          </article>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            data-testid="history-prev"
          >
            이전
          </button>
          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            data-testid="history-next"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
