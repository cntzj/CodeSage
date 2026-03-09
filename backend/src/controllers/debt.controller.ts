import { Request, Response } from 'express';

import { env } from '../config/env';
import { getPrismaClient } from '../config/prisma';
import { mockStore } from '../services/mock-data';

export class DebtController {
  async list(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;
    const { status, priority } = req.query;

    if (env.USE_MOCK_DATA) {
      let debts = mockStore.debts.filter((debt) => debt.projectId === projectId);
      if (status) {
        debts = debts.filter((debt) => debt.status === status);
      }
      if (priority) {
        debts = debts.filter((debt) => debt.priority === priority);
      }

      debts.sort((a, b) => b.riskScore - a.riskScore);
      res.json({ items: debts, total: debts.length });
      return;
    }

    const where: Record<string, unknown> = { projectId };
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const debts = await getPrismaClient()!.techDebt.findMany({
      where,
      orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ items: debts, total: debts.length });
  }

  async stats(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;

    if (env.USE_MOCK_DATA) {
      const debts = mockStore.debts.filter((debt) => debt.projectId === projectId);
      const byType = debts.reduce<Record<string, number>>((acc, debt) => {
        acc[debt.debtType] = (acc[debt.debtType] ?? 0) + 1;
        return acc;
      }, {});
      const byStatus = debts.reduce<Record<string, number>>((acc, debt) => {
        acc[debt.status] = (acc[debt.status] ?? 0) + 1;
        return acc;
      }, {});
      const byPriority = debts.reduce<Record<string, number>>((acc, debt) => {
        acc[debt.priority] = (acc[debt.priority] ?? 0) + 1;
        return acc;
      }, {});

      res.json({
        total: debts.length,
        avgRiskScore: debts.length
          ? Math.round(debts.reduce((sum, debt) => sum + debt.riskScore, 0) / debts.length)
          : 0,
        byType,
        byStatus,
        byPriority,
        trend: [
          { date: '2026-03-03', count: 8 },
          { date: '2026-03-04', count: 10 },
          { date: '2026-03-05', count: 11 },
          { date: '2026-03-06', count: 9 },
          { date: '2026-03-07', count: 12 },
        ],
      });
      return;
    }

    const debts = await getPrismaClient()!.techDebt.findMany({ where: { projectId } });
    const byType = debts.reduce<Record<string, number>>((acc, debt) => {
      acc[debt.debtType] = (acc[debt.debtType] ?? 0) + 1;
      return acc;
    }, {});

    res.json({
      total: debts.length,
      avgRiskScore: debts.length
        ? Math.round(debts.reduce((sum, debt) => sum + debt.riskScore, 0) / debts.length)
        : 0,
      byType,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const payload = req.body as { status?: 'open' | 'in_progress' | 'resolved'; priority?: 'low' | 'medium' | 'high' };

    if (env.USE_MOCK_DATA) {
      const debt = mockStore.debts.find((item) => item.id === id);
      if (!debt) {
        res.status(404).json({ message: 'Debt not found' });
        return;
      }

      if (payload.status) {
        debt.status = payload.status;
        debt.resolvedAt = payload.status === 'resolved' ? new Date() : null;
      }

      if (payload.priority) {
        debt.priority = payload.priority;
      }

      res.json(debt);
      return;
    }

    const debt = await getPrismaClient()!.techDebt.update({
      where: { id },
      data: {
        status: payload.status,
        priority: payload.priority,
        resolvedAt: payload.status === 'resolved' ? new Date() : null,
      },
    });

    res.json(debt);
  }
}

export const debtController = new DebtController();
