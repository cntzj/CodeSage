export interface PullRequestSummary {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export interface PRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface ReviewCommentInput {
  body: string;
  path: string;
  line: number;
  side?: 'LEFT' | 'RIGHT';
  commit_id?: string;
}

export interface RepositorySummary {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}
