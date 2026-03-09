import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { getPrismaClient } from '../config/prisma';
import { reviewQueueService } from '../queues/review-queue';
import { mockStore } from '../services/mock-data';

interface GitHubWebhookPayload {
  action: string;
  pull_request?: {
    number: number;
    title: string;
    body: string;
    user: { login: string };
    head: { ref: string; sha: string };
    base: { ref: string; sha: string };
  };
  installation?: {
    id: number;
  };
  repository?: {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
  };
}

export class WebhookController {
  async handleGitHubWebhook(req: Request, res: Response): Promise<void> {
    const event = req.header('x-github-event');
    const payload = req.body as GitHubWebhookPayload;

    logger.info('GitHub webhook received', {
      traceId: req.traceId,
      event,
      action: payload.action,
      repository: payload.repository?.full_name,
    });

    if (event === 'pull_request' && payload.pull_request && payload.repository) {
      if (['opened', 'synchronize', 'reopened'].includes(payload.action)) {
        const projectId = await this.ensureProject(payload);
        if (env.USE_MOCK_DATA) {
          this.upsertMockPullRequest(projectId, payload);
        }

        await reviewQueueService.addReviewJob({
          projectId,
          installationId: payload.installation?.id ?? Number(env.GITHUB_INSTALLATION_ID ?? 0),
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          prNumber: payload.pull_request.number,
        });
      }
    }

    if (event === 'installation') {
      logger.info('Installation event received', {
        action: payload.action,
        installationId: payload.installation?.id,
      });
    }

    res.status(200).json({ message: 'Webhook processed' });
  }

  private async ensureProject(payload: GitHubWebhookPayload): Promise<string> {
    if (!payload.repository) {
      throw new Error('Missing repository in webhook payload');
    }

    if (env.USE_MOCK_DATA) {
      const existing = mockStore.projects.find(
        (project) => Number(project.githubRepoId) === payload.repository!.id,
      );
      if (existing) {
        return existing.id;
      }

      const project = {
        id: uuidv4(),
        githubRepoId: BigInt(payload.repository.id),
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        owner: payload.repository.owner.login,
        defaultBranch: 'main',
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.projects.push(project);
      return project.id;
    }

    const prisma = getPrismaClient()!;
    const project = await prisma.project.upsert({
      where: { githubRepoId: BigInt(payload.repository.id) },
      create: {
        githubRepoId: BigInt(payload.repository.id),
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        owner: payload.repository.owner.login,
      },
      update: {
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        owner: payload.repository.owner.login,
      },
    });

    return project.id;
  }

  private upsertMockPullRequest(projectId: string, payload: GitHubWebhookPayload): void {
    if (!payload.pull_request) {
      return;
    }

    const existing = mockStore.pullRequests.find(
      (pullRequest) =>
        pullRequest.projectId === projectId &&
        pullRequest.githubPrNumber === payload.pull_request!.number,
    );

    if (existing) {
      existing.title = payload.pull_request.title;
      existing.description = payload.pull_request.body ?? '';
      existing.author = payload.pull_request.user.login;
      existing.branchFrom = payload.pull_request.head.ref;
      existing.branchTo = payload.pull_request.base.ref;
      existing.updatedAt = new Date();
      return;
    }

    mockStore.pullRequests.push({
      id: `demo-pr-${payload.pull_request.number}`,
      projectId,
      githubPrNumber: payload.pull_request.number,
      title: payload.pull_request.title,
      description: payload.pull_request.body ?? '',
      author: payload.pull_request.user.login,
      branchFrom: payload.pull_request.head.ref,
      branchTo: payload.pull_request.base.ref,
      status: 'open',
      riskLevel: 'medium',
      summary: 'Webhook synced pull request.',
      rawDiff: '',
      installationId: payload.installation?.id ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const webhookController = new WebhookController();
