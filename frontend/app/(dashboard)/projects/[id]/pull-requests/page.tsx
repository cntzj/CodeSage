import { PRTable } from '@/components/pull-requests/PRTable';
import { getPullRequests } from '@/lib/api';

interface PageProps {
  params: { id: string };
  searchParams: {
    status?: string;
    riskLevel?: string;
    q?: string;
  };
}

export default async function PullRequestsPage({ params, searchParams }: PageProps) {
  const result = await getPullRequests(params.id, {
    status: searchParams.status ?? '',
    riskLevel: searchParams.riskLevel ?? '',
    q: searchParams.q ?? '',
  });

  return (
    <div className="space-y-4">
      <h2 className="page-title">Pull Requests</h2>

      <form className="card grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="搜索标题 / 作者"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="merged">Merged</option>
        </select>
        <select
          name="riskLevel"
          defaultValue={searchParams.riskLevel}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">全部风险</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white" type="submit">
          筛选
        </button>
      </form>

      <PRTable projectId={params.id} data={result.items} />
    </div>
  );
}
