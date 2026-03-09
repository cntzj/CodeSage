export type RiskLevel = 'low' | 'medium' | 'high';

export type ReviewIssueSeverity = 'info' | 'warning' | 'error';

export type ReviewIssueCategory =
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'style';

export interface ReviewIssue {
  file: string;
  line: number;
  severity: ReviewIssueSeverity;
  category: ReviewIssueCategory;
  message: string;
  suggestion: string;
  codeExample?: string;
}

export interface ReviewReport {
  summary: string;
  riskLevel: RiskLevel;
  issues: ReviewIssue[];
  suggestions: string[];
  relatedPRs: string[];
}

export interface ReviewParams {
  projectName: string;
  prTitle: string;
  prDescription: string;
  diff: string;
  context: string;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'context';
  lineNumber: number;
  content: string;
}

export interface DiffChunk {
  filePath: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  changes: DiffChange[];
}
