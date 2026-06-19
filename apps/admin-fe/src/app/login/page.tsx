import { LoginForm } from './login-form';

export default function LoginPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-2xl font-semibold">테이블오더 Admin</h1>
        <p className="mt-2 text-sm text-slate-600">매장 운영자 로그인</p>
      </div>
      <LoginForm />
    </main>
  );
}
