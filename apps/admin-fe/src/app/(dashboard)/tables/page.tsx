'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRegisterTable, useTables } from '@/lib/queries/dashboard';

export default function TablesPage(): JSX.Element {
  const tables = useTables();
  const register = useRegisterTable();

  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const num = Number(tableNumber);
    if (!Number.isInteger(num) || num < 1) {
      setError('테이블 번호를 올바르게 입력하세요');
      return;
    }
    try {
      const res = await register.mutateAsync({ tableNumber: num, password });
      setMessage(`테이블 ${res.table.tableNumber} 등록 완료`);
      setTableNumber('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 실패');
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6" data-testid="tables-page">
      <h1 className="mb-6 text-xl font-bold text-slate-800">테이블 관리</h1>

      <form
        onSubmit={onSubmit}
        className="mb-8 space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        data-testid="table-register-form"
      >
        <h2 className="text-sm font-semibold text-slate-700">테이블 등록</h2>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="테이블 번호"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-32 rounded border border-slate-300 px-3 py-2 text-sm"
            data-testid="register-number"
          />
          <input
            type="password"
            placeholder="테이블 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            data-testid="register-password"
          />
          <button
            type="submit"
            disabled={register.isPending || password.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            data-testid="register-submit"
          >
            등록
          </button>
        </div>
        {message && <p className="text-xs text-green-600">{message}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-slate-400">
          이미 있는 번호로 등록하면 비밀번호가 갱신됩니다.
        </p>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">등록된 테이블</h2>
        {tables.isLoading && <p className="text-sm text-slate-400">불러오는 중...</p>}
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {tables.data?.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-4 py-3"
              data-testid={`table-row-${t.id}`}
            >
              <span className="text-sm text-slate-700">테이블 {t.tableNumber}</span>
              <Link
                href={`/tables/${t.id}/history`}
                className="text-xs font-medium text-blue-600"
              >
                과거 내역
              </Link>
            </li>
          ))}
          {tables.data?.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              등록된 테이블이 없습니다
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
