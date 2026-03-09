import { Request, Response } from 'express';

import { env } from '../config/env';
import { getPrismaClient } from '../config/prisma';
import { mockStore } from '../services/mock-data';

export class DashboardController {
  async overview(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;

    if (env.USE_MOCK_DATA) {
      const prs = mockStore.pullRequests.filter((pr) => pr.projectId === projectId);
      const debts = mockStore.debts.filter((debt) => debt.projectId === projectId);
      const criticalDebts = debts.filter((debt) => debt.priority === 'high').slice(0, 5);

      res.json({
        stats: {
          totalPRs: prs.length,
          reviewedPRs: prs.length,
          totalDebts: debts.length,
          highRiskPRs: prs.filter((pr) => pr.riskLevel === 'high').length,
        },
        activities: [
          {
            id: '1',
            type: 'review_completed',
            message: 'PR #42 review completed (risk: medium)',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'debt_detected',
            message: 'New FIXME detected in webhook controller',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        riskTrend: [
          { date: '2026-03-03', low: 2, medium: 3, high: 1 },
          { date: '2026-03-04', low: 3, medium: 2, high: 1 },
          { date: '2026-03-05', low: 2, medium: 4, high: 2 },
          { date: '2026-03-06', low: 4, medium: 3, high: 1 },
          { date: '2026-03-07', low: 3, medium: 3, high: 2 },
        ],
        pendingDebts: criticalDebts,
      });
      return;
    }

    const prisma = getPrismaClient()!;
    const [prs, debts] = await Promise.all([
      prisma.pullRequest.findMany({ where: { projectId }, include: { comments: true } }),
      prisma.techDebt.findMany({ where: { projectId }, orderBy: { riskScore: 'desc' } }),
    ]);

    res.json({
      stats: {
        totalPRs: prs.length,
        reviewedPRs: prs.filter((pr) => pr.summary).length,
        totalDebts: debts.length,
        highRiskPRs: prs.filter((pr) => pr.riskLevel === 'high').length,
      },
      activities: prs.slice(0, 10).map((pr) => ({
        id: pr.id,
        type: 'review_completed',
        message: `PR #${pr.githubPrNumber} reviewed`,
        createdAt: pr.updatedAt,
      })),
      riskTrend: [],
      pendingDebts: debts.slice(0, 5),
    });
  }
}

export const dashboardController = new DashboardController();
