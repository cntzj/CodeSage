'use client';

import { useEffect, useState } from 'react';

import { DebtBoard } from '@/components/debts/DebtBoard';
import { DebtStats } from '@/components/debts/DebtStats';
import { getDebts, getDebtStats, updateDebtStatus } from '@/lib/api';
import { DebtItem } from '@/types';

interface PageProps {
  params: { id: string };
}

interface DebtStatsResponse {
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  trend: Array<{ date: string; count: number }>;
}

export default function DebtsPage({ params }: PageProps) {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [stats, setStats] = useState<DebtStatsResponse>({ byType: {}, byPriority: {}, trend: [] });
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [debtsResponse, statsResponse] = await Promise.all([
      getDebts(params.id),
      getDebtStats(params.id),
    ]);

    setDebts(debtsResponse.items);
    setStats({
      byType: statsResponse.byType,
      byPriority: statsResponse.byPriority,
      trend: statsResponse.trend,
    });
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [params.id]);

  async function onStatusChange(id: string, status: DebtItem['status']) {
    setDebts((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await updateDebtStatus(id, { status });
    } catch {
      // Keep optimistic UI in mock mode.
    }
  }

  if (loading) {
    return <div className="card p-6 text-sm text-ink/60">债务数据加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="page-title">Debt Board</h2>
      <DebtStats stats={stats} />
      <DebtBoard items={debts} onStatusChange={onStatusChange} />
    </div>
  );
}
