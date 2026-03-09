import { v4 as uuidv4 } from 'uuid';

import { ReviewReport } from '../types/review';

export interface MockProject {
  id: string;
  githubRepoId: bigint;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPullRequest {
  id: string;
  projectId: string;
  githubPrNumber: number;
  title: string;
  description: string;
  author: string;
  branchFrom: string;
  branchTo: string;
  status: 'open' | 'closed' | 'merged';
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  rawDiff: string;
  installationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockReviewComment {
  id: string;
  prId: string;
  filePath: string;
  lineNumber: number;
  severity: 'info' | 'warning' | 'error';
  category: 'security' | 'performance' | 'maintainability' | 'style';
  message: string;
  suggestion: string;
  createdAt: Date;
}

export interface MockDebt {
  id: string;
  projectId: string;
  debtType: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'BUG';
  description: string;
  filePath: string;
  lineNumber: number;
  author: string;
  priority: 'low' | 'medium' | 'high';
  riskScore: number;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface MockKnowledgeNode {
  id: string;
  projectId: string;
  nodeType: 'function' | 'class' | 'module' | 'api' | 'concept';
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  description: string;
}

export interface MockKnowledgeRelation {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
}

const now = new Date();

const projects: MockProject[] = [
  {
    id: 'demo-project',
    githubRepoId: BigInt(1001),
    name: 'CodeSage Demo',
    fullName: 'codesage/codesage-demo',
    owner: 'codesage',
    defaultBranch: 'main',
    config: {
      model: 'gpt-4.1',
      rules: {
        security: true,
        performance: true,
        maintainability: true,
      },
    },
    createdAt: now,
    updatedAt: now,
  },
];

const pullRequests: MockPullRequest[] = [
  {
    id: 'demo-pr-42',
    projectId: projects[0].id,
    githubPrNumber: 42,
    title: 'Improve authentication flow and input validation',
    description: 'Refactor login endpoint and add stronger validation logic.',
    author: 'jerry',
    branchFrom: 'feature/auth-hardening',
    branchTo: 'main',
    status: 'open',
    riskLevel: 'medium',
    summary: 'Adds validation and updates token creation path.',
    rawDiff: `diff --git a/src/auth.ts b/src/auth.ts\n@@ -10,6 +10,8 @@\n-const token = sign(payload, SECRET);\n+if (!input.email) throw new Error('email required');\n+const token = sign(payload, SECRET, { expiresIn: '1h' });`,
    installationId: 0,
    createdAt: now,
    updatedAt: now,
  },
];

const reviewComments: MockReviewComment[] = [
  {
    id: 'demo-comment-1',
    prId: pullRequests[0].id,
    filePath: 'src/auth.ts',
    lineNumber: 11,
    severity: 'warning',
    category: 'security',
    message: 'Ensure SECRET is rotated regularly and not committed in plain env files.',
    suggestion: 'Store signing secret in a managed secret store and rotate every 90 days.',
    createdAt: now,
  },
];

const debts: MockDebt[] = [
  {
    id: 'demo-debt-1',
    projectId: projects[0].id,
    debtType: 'TODO',
    description: 'Replace temporary in-memory cache with Redis distributed cache.',
    filePath: 'src/utils/cache.ts',
    lineNumber: 14,
    author: 'jerry',
    priority: 'medium',
    riskScore: 52,
    status: 'open',
    createdAt: now,
    resolvedAt: null,
  },
  {
    id: 'demo-debt-2',
    projectId: projects[0].id,
    debtType: 'FIXME',
    description: 'Add rate-limit handling for GitHub webhook burst traffic.',
    filePath: 'src/controllers/webhook.controller.ts',
    lineNumber: 45,
    author: 'jerry',
    priority: 'high',
    riskScore: 81,
    status: 'in_progress',
    createdAt: now,
    resolvedAt: null,
  },
];

const knowledgeNodes: MockKnowledgeNode[] = [
  {
    id: 'demo-node-1',
    projectId: projects[0].id,
    nodeType: 'class',
    name: 'CodeReviewerService',
    filePath: 'src/services/code-reviewer.ts',
    lineStart: 1,
    lineEnd: 120,
    description: 'Coordinates PR fetch, context extraction, AI review, persistence and publication.',
  },
  {
    id: 'demo-node-2',
    projectId: projects[0].id,
    nodeType: 'function',
    name: 'parseDiff',
    filePath: 'src/utils/diff-parser.ts',
    lineStart: 1,
    lineEnd: 110,
    description: 'Parses unified diff into structured chunks with per-line change metadata.',
  },
];

const knowledgeRelations: MockKnowledgeRelation[] = [
  {
    id: 'demo-relation-1',
    sourceNodeId: knowledgeNodes[0].id,
    targetNodeId: knowledgeNodes[1].id,
    relationType: 'uses',
  },
];

const reviewReports = new Map<string, ReviewReport>();

export const mockStore = {
  projects,
  pullRequests,
  reviewComments,
  debts,
  knowledgeNodes,
  knowledgeRelations,
  reviewReports,

  findProject(projectId: string): MockProject | undefined {
    return projects.find((project) => project.id === projectId);
  },

  findPullRequest(projectId: string, prNumber: number): MockPullRequest | undefined {
    return pullRequests.find(
      (pullRequest) => pullRequest.projectId === projectId && pullRequest.githubPrNumber === prNumber,
    );
  },
};
