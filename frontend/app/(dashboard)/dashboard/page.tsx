import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RiskTrendChart } from '@/components/dashboard/RiskTrendChart';
import { StatCards } from '@/components/dashboard/StatCards';
import { getDashboard } from '@/lib/api';
import { DEFAULT_PROJECT_ID } from '@/lib/utils';

export default async function DashboardPage() {
  const overview = await getDashboard(DEFAULT_PROJECT_ID);

  return (
    <div className="space-y-4">
      <h2 className="page-title">项目概览</h2>
      <StatCards stats={overview.stats} />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RiskTrendChart data={overview.riskTrend} />
        <ActivityFeed items={overview.activities} />
      </div>
    </div>
  );
}
