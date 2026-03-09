import { ReviewIssue } from '@/types';

const severityStyles: Record<string, string> = {
  info: 'bg-tide/10 text-tide',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
};

export function ReviewComment({ issue }: { issue: ReviewIssue }) {
  return (
    <article className="rounded-xl border border-ink/10 bg-white/80 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityStyles[issue.severity]}`}>
          {issue.severity.toUpperCase()}
        </span>
        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{issue.category}</span>
        <span className="font-[var(--font-mono)] text-xs text-ink/65">
          {issue.file ?? 'unknown'}:{issue.line ?? 0}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium">{issue.message}</p>
      <p className="mt-1 text-sm text-ink/75">建议: {issue.suggestion}</p>
    </article>
  );
}
