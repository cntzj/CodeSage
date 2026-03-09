import { PRDetail } from '@/components/pull-requests/PRDetail';
import { getPullRequest } from '@/lib/api';

interface PageProps {
  params: {
    id: string;
    prNumber: string;
  };
}

export default async function PullRequestDetailPage({ params }: PageProps) {
  const detail = await getPullRequest(params.id, params.prNumber);

  return (
    <div className="space-y-4">
      <h2 className="page-title">PR 详情</h2>
      <PRDetail data={detail} />
    </div>
  );
}
