'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/shared/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clear = useAuthStore((s) => s.clear);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      clear();
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [isAuthenticated, clear, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" data-testid="dashboard-shell">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
