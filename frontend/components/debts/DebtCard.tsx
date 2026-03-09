import { DebtItem } from '@/types';

const priorityStyles: Record<DebtItem['priority'], string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export function DebtCard({ debt }: { debt: DebtItem }) {
  return (
    <article className="rounded-xl border border-ink/10 bg-white/85 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[debt.priority]}`}>
          {debt.priority.toUpperCase()}
        </span>
        <span className="font-[var(--font-mono)] text-xs text-ink/50">{debt.debtType}</span>
      </div>
      <p className="mt-2 text-sm font-medium leading-relaxed">{debt.description}</p>
      <p className="mt-2 font-[var(--font-mono)] text-xs text-ink/55">
        {debt.filePath}:{debt.lineNumber}
      </p>
      <p className="mt-1 text-xs text-ink/55">Risk Score: {debt.riskScore}</p>
    </article>
  );
}
