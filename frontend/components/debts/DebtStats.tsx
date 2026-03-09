'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#2f5f5c', '#d96c3c', '#11213a', '#6f8f82', '#b15b36'];

interface DebtStatsProps {
  stats: {
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    trend: Array<{ date: string; count: number }>;
  };
}

export function DebtStats({ stats }: DebtStatsProps) {
  const typeData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats.byPriority).map(([name, value]) => ({ name, value }));

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="card p-4">
        <h3 className="text-sm font-semibold">债务趋势</h3>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2f5f5c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card p-4">
        <h3 className="text-sm font-semibold">类型分布</h3>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={90}>
                {typeData.map((entry, index) => (
                  <Cell key={`${entry.name}-${entry.value}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card p-4">
        <h3 className="text-sm font-semibold">优先级分布</h3>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#d96c3c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
