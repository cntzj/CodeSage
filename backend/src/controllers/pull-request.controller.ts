import { Request, Response } from 'express';

import { env } from '../config/env';
import { getPrismaClient } from '../config/prisma';
import { codeReviewerService } from '../services/code-reviewer';
import { mockStore } from '../services/mock-data';

export class PullRequestController {
  async listByProject(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;
    const { status, riskLevel, q } = req.query;

    if (env.USE_MOCK_DATA) {
      let data = mockStore.pullRequests.filter((pr) => pr.projectId === projectId);
      if (status) {
        data = data.filter((pr) => pr.status === status);
      }
      if (riskLevel) {
        data = data.filter((pr) => pr.riskLevel === riskLevel);
      }
      if (q) {
        const keyword = String(q).toLowerCase();
        data = data.filter(
          (pr) => pr.title.toLowerCase().includes(keyword) || pr.author.toLowerCase().includes(keyword),
        );
      }
      res.json({ items: data, total: data.length });
      return;
    }

    const where: Record<string, unknown> = { projectId };
    if (status) {
      where.status = status;
    }
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    const prs = await getPrismaClient()!.pullRequest.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { comments: true },
    });

    const filtered = q
      ? prs.filter((pr) =>
          [pr.title ?? '', pr.author ?? '']
            .join(' ')
            .toLowerCase()
            .includes(String(q).toLowerCase()),
        )
      : prs;

    res.json({ items: filtered, total: filtered.length });
  }

  async get(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (env.USE_MOCK_DATA) {
      const pr = mockStore.pullRequests.find((item) => item.id === id);
      if (!pr) {
        res.status(404).json({ message: 'Pull request not found' });
        return;
      }

      const comments = mockStore.reviewComments.filter((comment) => comment.prId === pr.id);
      const review = mockStore.reviewReports.get(pr.id);
      res.json({ ...pr, comments, review });
      return;
    }

    const pullRequest = await getPrismaClient()!.pullRequest.findUnique({
      where: { id },
      include: { comments: true },
    });

    if (!pullRequest) {
      res.status(404).json({ message: 'Pull request not found' });
      return;
    }

    res.json(pullRequest);
  }

  async getByNumber(req: Request, res: Response): Promise<void> {
    const { id: projectId, prNumber } = req.params;
    const prNo = Number(prNumber);

    if (env.USE_MOCK_DATA) {
      const pr = mockStore.findPullRequest(projectId, prNo);
      if (!pr) {
        res.status(404).json({ message: 'Pull request not found' });
        return;
      }

      const comments = mockStore.reviewComments.filter((comment) => comment.prId === pr.id);
      const review = mockStore.reviewReports.get(pr.id);
      res.json({ ...pr, comments, review });
      return;
    }

    const pullRequest = await getPrismaClient()!.pullRequest.findUnique({
      where: {
        projectId_githubPrNumber: {
          projectId,
          githubPrNumber: prNo,
        },
      },
      include: { comments: true },
    });

    if (!pullRequest) {
      res.status(404).json({ message: 'Pull request not found' });
      return;
    }

    res.json(pullRequest);
  }

  async getReview(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (env.USE_MOCK_DATA) {
      const review = mockStore.reviewReports.get(id);
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }
      res.json(review);
      return;
    }

    const pr = await getPrismaClient()!.pullRequest.findUnique({
      where: { id },
      include: { comments: true },
    });

    if (!pr) {
      res.status(404).json({ message: 'Pull request not found' });
      return;
    }

    res.json({
      summary: pr.summary,
      riskLevel: pr.riskLevel,
      issues: pr.comments,
    });
  }

  async triggerReview(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (env.USE_MOCK_DATA) {
      const pr = mockStore.pullRequests.find((item) => item.id === id);
      if (!pr) {
        res.status(404).json({ message: 'Pull request not found' });
        return;
      }

      const report = await codeReviewerService.reviewByLocalPR(pr.projectId, pr.githubPrNumber);
      res.status(202).json({ message: 'Review started', report });
      return;
    }

    const pr = await getPrismaClient()!.pullRequest.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!pr) {
      res.status(404).json({ message: 'Pull request not found' });
      return;
    }

    const project = pr.project;
    const report = await codeReviewerService.reviewPullRequest({
      projectId: project.id,
      installationId: pr.installationId ?? 0,
      owner: project.owner,
      repo: project.name,
      prNumber: pr.githubPrNumber,
    });

    res.status(202).json({ message: 'Review completed', report });
  }
}

export const pullRequestController = new PullRequestController();
