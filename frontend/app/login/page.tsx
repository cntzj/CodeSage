'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-16">
      <form onSubmit={onSubmit} className="card w-full space-y-4 p-8">
        <h1 className="text-2xl font-semibold">登录 CodeSage</h1>
        <label className="block space-y-1 text-sm">
          <span>邮箱</span>
          <input
            required
            type="email"
            className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2 outline-none ring-0 transition focus:border-tide"
            placeholder="you@company.com"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>密码</span>
          <input
            required
            type="password"
            className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2 outline-none ring-0 transition focus:border-tide"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </main>
  );
}
