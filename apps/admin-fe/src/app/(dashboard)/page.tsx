'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDashboard } from '@/lib/queries/dashboard';
import { TableCard } from '@/components/dashboard/table-card';
import { OrderDetailModal } from '@/components/dashboard/order-detail-modal';

const HIGHLIGHT_MS = 5000;

export default function DashboardHomePage(): JSX.Element {
  const { data, isLoading } = useDashboard(); // 2초 폴링 (refetchInterval)

  const [detailTableId, setDetailTableId] = useState<number | null>(null);
  const [filterTableId, setFilterTableId] = useState<number | 'all'>('all');
  const [highlights, setHighlights] = useState<Set<number>>(new Set());

  // 폴링 diff: 직전 폴링 대비 테이블의 최신 주문번호가 바뀌면 신규 주문으로 보고 5초 강조 (US-A-10)
  const prevLatestRef = useRef<Map<number, string | undefined>>(new Map());
  useEffect(() => {
    if (!data) return;
    const prev = prevLatestRef.current;
    const isInitial = prev.size === 0;
    const nextMap = new Map<number, string | undefined>();
    const newlyOrdered: number[] = [];
    for (const s of data) {
      const latest = s.recentOrderPreviews[0]?.orderNumber;
      nextMap.set(s.tableId, latest);
      if (!isInitial && latest && latest !== prev.get(s.tableId)) {
        newlyOrdered.push(s.tableId);
      }
    }
    prevLatestRef.current = nextMap;
    if (newlyOrdered.length === 0) return;
    setHighlights((h) => {
      const n = new Set(h);
      newlyOrdered.forEach((id) => n.add(id));
      return n;
    });
    const timers = newlyOrdered.map((id) =>
      setTimeout(() => {
        setHighlights((h) => {
          const n = new Set(h);
          n.delete(id);
          return n;
        });
      }, HIGHLIGHT_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [data]);

  const summaries = data ?? [];
  const visible = useMemo(
    () =>
      filterTableId === 'all'
        ? summaries
        : summaries.filter((s) => s.tableId === filterTableId),
    [summaries, filterTableId],
  );

  const detailTable = summaries.find((s) => s.tableId === detailTableId) ?? null;

  return (
    <main className="min-h-screen p-6" data-testid="dashboard">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">실시간 대시보드</h1>
        <select
          value={filterTableId}
          onChange={(e) =>
            setFilterTableId(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          data-testid="table-filter"
        >
          <option value="all">전체 테이블</option>
          {summaries.map((s) => (
            <option key={s.tableId} value={s.tableId}>
              테이블 {s.tableNumber}
            </option>
          ))}
        </select>
      </header>

      {isLoading && <p className="text-center text-sm text-slate-400">불러오는 중...</p>}
      {!isLoading && summaries.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-400" data-testid="dashboard-empty">
          등록된 테이블이 없습니다. 테이블 메뉴에서 등록하세요.
        </p>
      )}

      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        data-testid="dashboard-grid"
      >
        {visible.map((s) => (
          <TableCard
            key={s.tableId}
            summary={s}
            highlighted={highlights.has(s.tableId)}
            onClick={() => setDetailTableId(s.tableId)}
          />
        ))}
      </div>

      {detailTable && (
        <OrderDetailModal
          tableId={detailTable.tableId}
          tableNumber={detailTable.tableNumber}
          onClose={() => setDetailTableId(null)}
        />
      )}
    </main>
  );
}
