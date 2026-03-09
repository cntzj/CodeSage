'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Point {
  date: string;
  low: number;
  medium: number;
  high: number;
}

export function RiskTrendChart({ data }: { data: Point[] }) {
  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold">Risk Trend</h2>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dfd9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="low" stackId="risk" stroke="#2f5f5c" fill="#2f5f5c" fillOpacity={0.25} />
            <Area type="monotone" dataKey="medium" stackId="risk" stroke="#d96c3c" fill="#d96c3c" fillOpacity={0.35} />
            <Area type="monotone" dataKey="high" stackId="risk" stroke="#11213a" fill="#11213a" fillOpacity={0.35} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
