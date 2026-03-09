import Link from 'next/link';

import { PullRequestItem } from '@/types';

const riskTone: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export function PRTable({ projectId, data }: { projectId: string; data: PullRequestItem[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-ink/5 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">编号</th>
            <th className="px-4 py-3 font-medium">标题</th>
            <th className="px-4 py-3 font-medium">作者</th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">风险</th>
            <th className="px-4 py-3 font-medium">更新时间</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-[var(--font-mono)]">#{item.githubPrNumber}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/projects/${projectId}/pull-requests/${item.githubPrNumber}`}
                  className="font-medium text-ink hover:text-tide"
                >
                  {item.title}
                </Link>
              </td>
              <td className="px-4 py-3">@{item.author}</td>
              <td className="px-4 py-3 capitalize">{item.status}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs ${riskTone[item.riskLevel]}`}>{item.riskLevel}</span>
              </td>
              <td className="px-4 py-3 text-ink/65">{new Date(item.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
