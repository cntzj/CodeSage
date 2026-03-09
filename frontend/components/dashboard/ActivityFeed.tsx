interface ActivityItem {
  id: string;
  message: string;
  createdAt: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-ink/10 bg-white/70 p-3">
            <p className="text-sm text-ink/90">{item.message}</p>
            <p className="mt-1 font-[var(--font-mono)] text-xs text-ink/50">{new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
