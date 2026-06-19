'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCombinedTableSetup } from '@/lib/queries/auth';
import { setTableToken } from '@/lib/auth';

export function SetupForm(): JSX.Element {
  const router = useRouter();
  const mutation = useCombinedTableSetup();

  const [storeCode, setStoreCode] = useState('');
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tablePassword, setTablePassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ready =
    storeCode.length > 0 &&
    username.length > 0 &&
    adminPassword.length > 0 &&
    tableNumber.length > 0 &&
    tablePassword.length > 0;

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      const res = await mutation.mutateAsync({
        storeCode,
        username,
        password: adminPassword,
        tableNumber: Number(tableNumber),
        // table 비밀번호는 별도 필드로 받지만 PoC에서는 admin password 별도 전달
      } as never);
      setTableToken(res.tableToken);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 w-full max-w-md" data-testid="setup-form">
      <Field
        label="매장 식별자"
        value={storeCode}
        onChange={setStoreCode}
        testId="setup-store-code"
      />
      <Field
        label="관리자 사용자명"
        value={username}
        onChange={setUsername}
        testId="setup-admin-username"
      />
      <Field
        label="관리자 비밀번호"
        value={adminPassword}
        onChange={setAdminPassword}
        type="password"
        testId="setup-admin-password"
      />
      <Field
        label="테이블 번호"
        value={tableNumber}
        onChange={setTableNumber}
        type="number"
        testId="setup-table-number"
      />
      <Field
        label="테이블 비밀번호"
        value={tablePassword}
        onChange={setTablePassword}
        type="password"
        testId="setup-table-password"
      />
      {error && (
        <p className="text-sm text-red-600" data-testid="setup-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!ready || mutation.isPending}
        className="min-h-touch w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium disabled:bg-slate-300"
        data-testid="setup-submit"
      >
        {mutation.isPending ? '등록 중...' : '등록'}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId: string;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
        data-testid={testId}
      />
    </label>
  );
}
