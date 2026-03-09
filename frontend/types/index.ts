export type RiskLevel = 'low' | 'medium' | 'high';

export interface PullRequestItem {
  id: string;
  projectId: string;
  githubPrNumber: number;
  title: string;
  description: string;
  author: string;
  status: 'open' | 'closed' | 'merged';
  riskLevel: RiskLevel;
  summary: string;
  updatedAt: string;
  createdAt: string;
}

export interface PullRequestListResponse {
  items: PullRequestItem[];
  total: number;
}

export interface ReviewIssue {
  file?: string;
  line?: number;
  severity: 'info' | 'warning' | 'error';
  category: 'security' | 'performance' | 'maintainability' | 'style';
  message: string;
  suggestion: string;
}

export interface PullRequestDetail extends PullRequestItem {
  comments: ReviewIssue[];
  review?: {
    summary: string;
    riskLevel: RiskLevel;
    issues: ReviewIssue[];
    suggestions: string[];
  };
}

export interface KnowledgeNode {
  id: string;
  projectId: string;
  nodeType: 'function' | 'class' | 'module' | 'api' | 'concept';
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  description: string;
}

export interface KnowledgeRelation {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
}

export interface DebtItem {
  id: string;
  projectId: string;
  debtType: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'BUG';
  description: string;
  filePath: string;
  lineNumber: number;
  priority: 'low' | 'medium' | 'high';
  riskScore: number;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface DashboardOverview {
  stats: {
    totalPRs: number;
    reviewedPRs: number;
    totalDebts: number;
    highRiskPRs: number;
  };
  activities: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }>;
  riskTrend: Array<{
    date: string;
    low: number;
    medium: number;
    high: number;
  }>;
  pendingDebts: DebtItem[];
}
