interface StatCardsProps {
  stats: {
    totalPRs: number;
    reviewedPRs: number;
    totalDebts: number;
    highRiskPRs: number;
  };
}

const statConfig = [
  { key: 'totalPRs', label: 'Total PRs' },
  { key: 'reviewedPRs', label: 'Reviewed PRs' },
  { key: 'totalDebts', label: 'Open Debts' },
  { key: 'highRiskPRs', label: 'High Risk PRs' },
] as const;

export function StatCards({ stats }: StatCardsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {statConfig.map((item, index) => (
        <article
          key={item.key}
          className="card animate-rise p-4"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold">{stats[item.key]}</p>
        </article>
      ))}
    </section>
  );
}
