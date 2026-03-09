import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="card w-full max-w-3xl space-y-6 p-8 md:p-12">
        <p className="inline-flex w-fit rounded-full bg-tide/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-tide">
          CodeSage
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          AI 代码审查 + 知识图谱 + 技术债务管理，一体化工作台
        </h1>
        <p className="max-w-2xl text-sm text-ink/80 md:text-base">
          集成 GitHub Webhook，自动触发审查；把代码知识沉淀为可搜索图谱；追踪 TODO/FIXME 风险并形成看板。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:translate-y-[-1px]"
          >
            进入 Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-ink/20 px-5 py-2 text-sm font-medium transition hover:border-ink/50"
          >
            登录
          </Link>
        </div>
      </div>
    </main>
  );
}
