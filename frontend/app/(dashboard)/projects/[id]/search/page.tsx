'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { searchKnowledge } from '@/lib/api';
import { KnowledgeNode } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('auth token rotate');
  const [results, setResults] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await searchKnowledge(query);
      setResults(response.items);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="page-title">智能语义搜索</h2>

      <form onSubmit={onSearch} className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
          placeholder="输入问题，例如：鉴权逻辑在哪实现？"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">
          {loading ? '搜索中...' : '搜索'}
        </button>
      </form>

      <div className="space-y-3">
        {results.map((node) => (
          <article key={node.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{node.name}</h3>
                <p className="mt-1 text-sm text-ink/70">{node.description}</p>
              </div>
              <span className="rounded-full bg-tide/10 px-2 py-1 text-xs font-medium text-tide">{node.nodeType}</span>
            </div>
            <p className="mt-2 font-[var(--font-mono)] text-xs text-ink/55">
              {node.filePath}:{node.lineStart}-{node.lineEnd}
            </p>
            <Link href={`/projects/${node.projectId}/knowledge`} className="mt-3 inline-flex text-sm font-medium text-tide">
              在图谱中查看
            </Link>
          </article>
        ))}

        {!loading && results.length === 0 ? (
          <div className="card p-4 text-sm text-ink/65">暂无结果，尝试更具体的关键描述。</div>
        ) : null}
      </div>
    </div>
  );
}
