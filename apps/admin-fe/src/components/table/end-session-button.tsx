'use client';

import { useState } from 'react';
import { useEndSession } from '@/lib/queries/table';

interface Props {
  tableId: number;
  onEnded?: () => void;
  className?: string;
}

/** "이용 완료" — 확인 팝업 후 세션 종료. 진행 중 주문이 있어도 강제 종료된다. */
export function EndSessionButton({ tableId, onEnded, className }: Props): JSX.Element {
  const endSession = useEndSession();
  const [error, setError] = useState<string | null>(null);

  const onClick = async (): Promise<void> => {
    if (!window.confirm('이 테이블의 이용을 완료하시겠습니까? 현재 주문은 과거 내역으로 이동합니다.')) {
      return;
    }
    setError(null);
    try {
      await endSession.mutateAsync(tableId);
      onEnded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 종료 실패');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={endSession.isPending}
        className={
          className ??
          'rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60'
        }
        data-testid="end-session"
      >
        {endSession.isPending ? '처리 중…' : '이용 완료'}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
