import { getPrismaClient } from '../config/prisma';
import { logger } from '../config/logger';
import { parseDiff } from '../utils/diff-parser';
import { ReviewReport } from '../types/review';
import { openAIClientService } from './ai/openai-client';
import { codeContextService } from './code-context';
import { gitHubClientService } from './github/client';
import { mockStore } from './mock-data';

export interface ReviewJobData {
  projectId: string;
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
}

export class CodeReviewerService {
  async reviewPullRequest(payload: ReviewJobData): Promise<ReviewReport> {
    const pullRequest = await gitHubClientService.getPullRequest(
      payload.installationId,
      payload.owner,
      payload.repo,
      payload.prNumber,
    );

    const diff = await gitHubClientService.getPullRequestDiff(
      payload.installationId,
      payload.owner,
      payload.repo,
      payload.prNumber,
    );

    const parsedDiff = parseDiff(diff);
    const context = await codeContextService.buildContext({
      installationId: payload.installationId,
      owner: payload.owner,
      repo: payload.repo,
      prNumber: payload.prNumber,
      baseRef: pullRequest.base.ref,
    });

    const reviewReport = await openAIClientService.reviewCode({
      projectName: `${payload.owner}/${payload.repo}`,
      prTitle: pullRequest.title,
      prDescription: pullRequest.body ?? '',
      diff: parsedDiff
        .map((chunk) => {
          const lines = chunk.changes
            .map((change) => {
              const prefix = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' ';
              return `${prefix}${change.content}`;
            })
            .join('\n');
          return `# ${chunk.filePath}\n${lines}`;
        })
        .join('\n\n'),
      context,
    });

    await this.saveReview(payload, reviewReport, diff);
    await this.publishReview(payload, reviewReport);

    return reviewReport;
  }

  async reviewByLocalPR(projectId: string, prNumber: number): Promise<ReviewReport> {
    const pr = mockStore.findPullRequest(projectId, prNumber);
    if (!pr) {
      throw new Error(`Pull request ${prNumber} not found in project ${projectId}`);
    }

    const reviewReport = await openAIClientService.reviewCode({
      projectName: 'mock-project',
      prTitle: pr.title,
      prDescription: pr.description,
      diff: pr.rawDiff,
      context: 'No external context in mock mode.',
    });

    mockStore.reviewReports.set(pr.id, reviewReport);
    return reviewReport;
  }

  private async saveReview(payload: ReviewJobData, report: ReviewReport, rawDiff: string): Promise<void> {
    const prisma = getPrismaClient();

    if (!prisma) {
      const mockPR = mockStore.findPullRequest(payload.projectId, payload.prNumber);
      if (mockPR) {
        mockPR.riskLevel = report.riskLevel;
        mockPR.summary = report.summary;
        mockStore.reviewReports.set(mockPR.id, report);
      }
      return;
    }

    const existing = await prisma.pullRequest.upsert({
      where: {
        projectId_githubPrNumber: {
          projectId: payload.projectId,
          githubPrNumber: payload.prNumber,
        },
      },
      create: {
        projectId: payload.projectId,
        githubPrNumber: payload.prNumber,
        title: 'Fetched from GitHub',
        description: '',
        status: 'open',
        riskLevel: report.riskLevel,
        summary: report.summary,
        rawDiff,
        installationId: payload.installationId,
      },
      update: {
        riskLevel: report.riskLevel,
        summary: report.summary,
        rawDiff,
      },
    });

    await prisma.reviewComment.deleteMany({ where: { prId: existing.id } });
    if (report.issues.length > 0) {
      await prisma.reviewComment.createMany({
        data: report.issues.map((issue) => ({
          prId: existing.id,
          filePath: issue.file,
          lineNumber: issue.line,
          severity: issue.severity,
          category: issue.category,
          message: issue.message,
          suggestion: issue.suggestion,
          codeExample: issue.codeExample,
        })),
      });
    }

    logger.info('Review saved', {
      projectId: payload.projectId,
      prNumber: payload.prNumber,
      issueCount: report.issues.length,
    });
  }

  private async publishReview(payload: ReviewJobData, report: ReviewReport): Promise<void> {
    const comments = report.issues
      .filter((issue) => issue.file && issue.line)
      .map((issue) => ({
        body: `[${issue.severity.toUpperCase()}] ${issue.message}\n\nSuggestion: ${issue.suggestion}`,
        path: issue.file,
        line: issue.line,
        side: 'RIGHT' as const,
      }));

    if (comments.length === 0 || payload.installationId === 0) {
      return;
    }

    await gitHubClientService.safeCreateComments(
      payload.installationId,
      payload.owner,
      payload.repo,
      payload.prNumber,
      comments,
    );
  }
}

export const codeReviewerService = new CodeReviewerService();
