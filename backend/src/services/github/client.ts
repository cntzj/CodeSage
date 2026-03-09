import { Octokit } from '@octokit/rest';

import { logger } from '../../config/logger';
import {
  PRFile,
  PullRequestSummary,
  RepositorySummary,
  ReviewCommentInput,
} from '../../types/github';
import { withRetry } from '../../utils/retry';
import { gitHubAuthService } from './auth';

export class GitHubClientService {
  private async getClient(installationId: number): Promise<Octokit> {
    const token = await gitHubAuthService.getInstallationToken(installationId);
    return new Octokit({ auth: token });
  }

  async getPullRequest(
    installationId: number,
    owner: string,
    repo: string,
    number: number,
  ): Promise<PullRequestSummary> {
    return withRetry(async () => {
      const client = await this.getClient(installationId);
      const result = await client.pulls.get({ owner, repo, pull_number: number });
      return result.data as PullRequestSummary;
    });
  }

  async getPullRequestDiff(
    installationId: number,
    owner: string,
    repo: string,
    number: number,
  ): Promise<string> {
    return withRetry(async () => {
      const client = await this.getClient(installationId);
      const result = await client.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: number,
        headers: { accept: 'application/vnd.github.v3.diff' },
      });
      return String(result.data);
    });
  }

  async listPullRequestFiles(
    installationId: number,
    owner: string,
    repo: string,
    number: number,
  ): Promise<PRFile[]> {
    return withRetry(async () => {
      const client = await this.getClient(installationId);
      const result = await client.pulls.listFiles({ owner, repo, pull_number: number, per_page: 100 });
      return result.data as PRFile[];
    });
  }

  async createReviewComment(
    installationId: number,
    owner: string,
    repo: string,
    prNumber: number,
    comment: ReviewCommentInput,
  ): Promise<void> {
    await withRetry(async () => {
      const client = await this.getClient(installationId);
      await client.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        body: comment.body,
        path: comment.path,
        line: comment.line,
        side: comment.side,
        commit_id: comment.commit_id,
      });
    });
  }

  async getFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    ref: string,
  ): Promise<string> {
    const client = await this.getClient(installationId);
    const result = await client.repos.getContent({ owner, repo, path, ref });

    if (Array.isArray(result.data) || !('content' in result.data)) {
      throw new Error(`Path is not a file: ${path}`);
    }

    return Buffer.from(result.data.content, 'base64').toString('utf8');
  }

  async listRepositories(installationId: number): Promise<RepositorySummary[]> {
    const client = await this.getClient(installationId);
    const result = await client.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });

    return result.data.repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
    }));
  }

  async safeCreateComments(
    installationId: number,
    owner: string,
    repo: string,
    prNumber: number,
    comments: ReviewCommentInput[],
  ): Promise<void> {
    for (const comment of comments) {
      try {
        await this.createReviewComment(installationId, owner, repo, prNumber, comment);
      } catch (error) {
        logger.warn('Failed to publish GitHub review comment', {
          owner,
          repo,
          prNumber,
          error: String(error),
        });
      }
    }
  }
}

export const gitHubClientService = new GitHubClientService();
