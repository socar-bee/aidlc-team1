'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

const NAV = [
  { href: '/', label: '대시보드', testId: 'nav-dashboard' },
  { href: '/tables', label: '테이블', testId: 'nav-tables' },
  { href: '/categories', label: '카테고리', testId: 'nav-categories' },
  { href: '/menus', label: '메뉴', testId: 'nav-menus' },
] as const;

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h1 className="text-base font-semibold">테이블오더 Admin</h1>
        <p className="mt-1 text-xs text-slate-500">{user?.username}</p>
      </div>
      <nav className="flex-1 px-2 py-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              className={`block rounded-md px-3 py-2 text-sm ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={clear}
        className="m-3 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        data-testid="sidebar-logout"
      >
        로그아웃
      </button>
    </aside>
  );
}
