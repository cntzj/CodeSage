import {
  DashboardOverview,
  DebtItem,
  KnowledgeNode,
  KnowledgeRelation,
  PullRequestDetail,
  PullRequestListResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

const fallbackOverview: DashboardOverview = {
  stats: {
    totalPRs: 12,
    reviewedPRs: 12,
    totalDebts: 28,
    highRiskPRs: 3,
  },
  activities: [
    {
      id: '1',
      type: 'review_completed',
      message: 'PR #42 review completed (risk: medium)',
      createdAt: new Date().toISOString(),
    },
  ],
  riskTrend: [
    { date: '2026-03-03', low: 2, medium: 3, high: 1 },
    { date: '2026-03-04', low: 3, medium: 3, high: 2 },
    { date: '2026-03-05', low: 4, medium: 2, high: 1 },
  ],
  pendingDebts: [],
};

const fallbackPRList: PullRequestListResponse = {
  items: [
    {
      id: 'demo-pr-42',
      projectId: 'demo-project',
      githubPrNumber: 42,
      title: 'Improve authentication flow and input validation',
      description: 'Refactor login endpoint and add stronger validation logic.',
      author: 'jerry',
      status: 'open',
      riskLevel: 'medium',
      summary: 'Adds validation and updates token creation path.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  total: 1,
};

export async function getDashboard(projectId: string): Promise<DashboardOverview> {
  try {
    return await request<DashboardOverview>(`/api/projects/${projectId}/dashboard`);
  } catch {
    return fallbackOverview;
  }
}

export async function getPullRequests(
  projectId: string,
  params?: Record<string, string>,
): Promise<PullRequestListResponse> {
  const search = new URLSearchParams(params).toString();
  const suffix = search ? `?${search}` : '';
  try {
    return await request<PullRequestListResponse>(`/api/projects/${projectId}/pull-requests${suffix}`);
  } catch {
    return fallbackPRList;
  }
}

export async function getPullRequest(projectId: string, prNumber: string): Promise<PullRequestDetail> {
  try {
    const raw = await request<Record<string, unknown>>(
      `/api/projects/${projectId}/pull-requests/${prNumber}`,
    );
    const comments = Array.isArray(raw.comments)
      ? raw.comments.map((issue) => {
          const typed = issue as Record<string, unknown>;
          return {
            severity: String(typed.severity ?? 'info') as 'info' | 'warning' | 'error',
            category: String(typed.category ?? 'style') as
              | 'security'
              | 'performance'
              | 'maintainability'
              | 'style',
            message: String(typed.message ?? ''),
            suggestion: String(typed.suggestion ?? ''),
            file: String(typed.file ?? typed.filePath ?? ''),
            line: Number(typed.line ?? typed.lineNumber ?? 0),
          };
        })
      : [];

    return {
      ...(raw as unknown as PullRequestDetail),
      comments,
    };
  } catch {
    return {
      ...fallbackPRList.items[0],
      comments: [
        {
          severity: 'warning',
          category: 'security',
          message: 'Ensure signing secret is rotated regularly.',
          suggestion: 'Use a managed secret vault and rotation policy.',
          file: 'src/auth.ts',
          line: 11,
        },
      ],
      review: {
        summary: 'Fallback review summary in offline mode.',
        riskLevel: 'medium',
        issues: [],
        suggestions: [],
      },
    };
  }
}

export async function triggerReview(prId: string): Promise<void> {
  await request(`/api/pull-requests/${prId}/review`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getKnowledgeGraph(projectId: string): Promise<{
  nodes: KnowledgeNode[];
  edges: KnowledgeRelation[];
}> {
  try {
    return await request(`/api/projects/${projectId}/knowledge/graph`);
  } catch {
    return {
      nodes: [
        {
          id: 'demo-node-1',
          projectId,
          nodeType: 'class',
          name: 'CodeReviewerService',
          filePath: 'src/services/code-reviewer.ts',
          lineStart: 1,
          lineEnd: 120,
          description: 'Coordinates review flow end to end.',
        },
        {
          id: 'demo-node-2',
          projectId,
          nodeType: 'function',
          name: 'parseDiff',
          filePath: 'src/utils/diff-parser.ts',
          lineStart: 1,
          lineEnd: 110,
          description: 'Parses unified diff into structured chunks.',
        },
      ],
      edges: [
        {
          id: 'demo-relation-1',
          sourceNodeId: 'demo-node-1',
          targetNodeId: 'demo-node-2',
          relationType: 'uses',
        },
      ],
    };
  }
}

export async function searchKnowledge(query: string): Promise<{ items: KnowledgeNode[]; total: number }> {
  try {
    return await request(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
  } catch {
    const fallbackNode: KnowledgeNode = {
      id: 'demo-node-2',
      projectId: 'demo-project',
      nodeType: 'function',
      name: 'parseDiff',
      filePath: 'src/utils/diff-parser.ts',
      lineStart: 1,
      lineEnd: 110,
      description: `Fallback result for query: ${query}`,
    };
    return { items: [fallbackNode], total: 1 };
  }
}

export async function getDebts(projectId: string): Promise<{ items: DebtItem[]; total: number }> {
  try {
    return await request(`/api/projects/${projectId}/debts`);
  } catch {
    return {
      items: [
        {
          id: 'demo-debt-1',
          projectId,
          debtType: 'TODO',
          description: 'Replace temporary in-memory cache with Redis.',
          filePath: 'src/utils/cache.ts',
          lineNumber: 14,
          priority: 'medium',
          riskScore: 52,
          status: 'open',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  }
}

export async function getDebtStats(projectId: string): Promise<{
  total: number;
  avgRiskScore: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  trend: Array<{ date: string; count: number }>;
}> {
  try {
    return await request(`/api/projects/${projectId}/debts/stats`);
  } catch {
    return {
      total: 1,
      avgRiskScore: 52,
      byType: { TODO: 1 },
      byStatus: { open: 1 },
      byPriority: { medium: 1 },
      trend: [
        { date: '2026-03-03', count: 1 },
        { date: '2026-03-04', count: 1 },
        { date: '2026-03-05', count: 2 },
      ],
    };
  }
}

export async function updateDebtStatus(
  debtId: string,
  payload: { status?: 'open' | 'in_progress' | 'resolved'; priority?: 'low' | 'medium' | 'high' },
): Promise<void> {
  await request(`/api/debts/${debtId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateProjectConfig(projectId: string, payload: Record<string, unknown>): Promise<void> {
  await request(`/api/projects/${projectId}/config`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
