import { SetupForm } from './setup-form';

export default function SetupPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-2xl font-semibold">테이블 등록</h1>
        <p className="mt-2 text-sm text-slate-600">
          매장 관리자가 1회만 등록하면 이후 자동 로그인됩니다.
        </p>
      </div>
      <SetupForm />
    </main>
  );
}
