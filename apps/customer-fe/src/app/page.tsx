'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTableAuthenticated } from '@/lib/auth';
import { MenuScreen } from '@/components/menu/menu-screen';

export default function HomePage(): JSX.Element {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isTableAuthenticated()) {
      router.replace('/setup');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">로딩 중...</p>
      </main>
    );
  }

  return <MenuScreen />;
}
