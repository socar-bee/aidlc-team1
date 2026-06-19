'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const REDIRECT_SECONDS = 5;

export function OrderSuccess({ orderNumber }: { orderNumber: string }): JSX.Element {
  const router = useRouter();
  const [remaining, setRemaining] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const redirect = setTimeout(() => router.replace('/'), REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      data-testid="order-success"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
        ✓
      </div>
      <h1 className="mt-6 text-xl font-bold text-slate-800">주문이 접수되었습니다</h1>
      <p className="mt-2 text-sm text-slate-500">주문번호</p>
      <p className="text-2xl font-bold tracking-wide text-blue-600" data-testid="order-number">
        {orderNumber}
      </p>
      <p className="mt-6 text-sm text-slate-400" data-testid="order-redirect-countdown">
        {remaining}초 후 메뉴 화면으로 이동합니다
      </p>
      <button
        type="button"
        onClick={() => router.replace('/')}
        className="mt-4 min-h-touch rounded-md border border-slate-300 px-5 py-2 text-sm"
        data-testid="order-go-menu"
      >
        지금 메뉴로 이동
      </button>
    </main>
  );
}
