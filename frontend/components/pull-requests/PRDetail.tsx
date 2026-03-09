'use client';

import { useState } from 'react';

import { triggerReview } from '@/lib/api';
import { PullRequestDetail } from '@/types';

import { ReviewComment } from './ReviewComment';

export function PRDetail({ data }: { data: PullRequestDetail }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onTriggerReview() {
    setLoading(true);
    setMessage('');
    try {
      await triggerReview(data.id);
      setMessage('重新审查任务已触发。');
    } catch {
      setMessage('触发失败，请检查后端状态。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            PR #{data.githubPrNumber}: {data.title}
          </h2>
          <button
            type="button"
            onClick={onTriggerReview}
            disabled={loading}
            className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? '触发中...' : '重新审查'}
          </button>
        </div>
        <p className="mt-2 text-sm text-ink/75">{data.description}</p>
        <p className="mt-2 text-xs text-ink/55">
          作者 @{data.author} · 状态 {data.status} · 风险 {data.riskLevel}
        </p>
        {message ? <p className="mt-2 text-sm text-tide">{message}</p> : null}
      </section>

      <section className="card p-4">
        <h3 className="text-lg font-semibold">审查摘要</h3>
        <p className="mt-2 text-sm text-ink/85">{data.review?.summary ?? data.summary}</p>
      </section>

      <section className="card p-4">
        <h3 className="text-lg font-semibold">审查意见 ({data.comments.length})</h3>
        <div className="mt-3 space-y-3">
          {data.comments.length === 0 ? (
            <p className="text-sm text-ink/65">暂无审查意见。</p>
          ) : (
            data.comments.map((issue, index) => <ReviewComment key={`${issue.message}-${index}`} issue={issue} />)
          )}
        </div>
      </section>
    </div>
  );
}
