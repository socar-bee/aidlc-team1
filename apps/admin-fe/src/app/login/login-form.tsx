'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLogin } from '@/lib/queries/auth';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const mutation = useAdminLogin();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [storeCode, setStoreCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ready = storeCode.length > 0 && username.length > 0 && password.length > 0;

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      const res = await mutation.mutateAsync({ storeCode, username, password });
      setAuth(res.accessToken, res.user, res.expiresAt);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 정보를 확인하세요');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 w-full max-w-md" data-testid="login-form">
      <Field
        label="매장 식별자"
        value={storeCode}
        onChange={setStoreCode}
        testId="login-store-code"
      />
      <Field label="사용자명" value={username} onChange={setUsername} testId="login-username" />
      <Field
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        testId="login-password"
      />
      {error && (
        <p className="text-sm text-red-600" data-testid="login-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!ready || mutation.isPending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-white font-medium disabled:bg-slate-400"
        data-testid="login-submit"
      >
        {mutation.isPending ? '로그인 중...' : '로그인'}
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
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base focus:border-slate-900 focus:outline-none"
        data-testid={testId}
      />
    </label>
  );
}
