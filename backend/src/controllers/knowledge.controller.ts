import { Request, Response } from 'express';

import { env } from '../config/env';
import { getPrismaClient } from '../config/prisma';
import { knowledgeExtractorService } from '../services/knowledge-extractor';
import { mockStore } from '../services/mock-data';

export class KnowledgeController {
  async getNodes(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;

    if (env.USE_MOCK_DATA) {
      const nodes = mockStore.knowledgeNodes.filter((node) => node.projectId === projectId);
      res.json({ items: nodes, total: nodes.length });
      return;
    }

    const nodes = await getPrismaClient()!.knowledgeNode.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ items: nodes, total: nodes.length });
  }

  async getGraph(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;

    if (env.USE_MOCK_DATA) {
      const nodes = mockStore.knowledgeNodes.filter((node) => node.projectId === projectId);
      const nodeIds = new Set(nodes.map((node) => node.id));
      const edges = mockStore.knowledgeRelations.filter(
        (relation) => nodeIds.has(relation.sourceNodeId) || nodeIds.has(relation.targetNodeId),
      );
      res.json({ nodes, edges });
      return;
    }

    const prisma = getPrismaClient()!;
    const nodes = await prisma.knowledgeNode.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
    const nodeIds = nodes.map((node) => node.id);
    const edges = await prisma.knowledgeRelation.findMany({
      where: {
        OR: [{ sourceNodeId: { in: nodeIds } }, { targetNodeId: { in: nodeIds } }],
      },
    });

    res.json({ nodes, edges });
  }

  async semanticSearch(req: Request, res: Response): Promise<void> {
    const query = String(req.query.q ?? '').trim();
    const topK = Number(req.query.topK ?? 10);

    if (!query) {
      res.status(400).json({ message: 'Query cannot be empty' });
      return;
    }

    if (env.USE_MOCK_DATA) {
      const keyword = query.toLowerCase();
      const items = mockStore.knowledgeNodes
        .filter(
          (node) =>
            node.name.toLowerCase().includes(keyword) || node.description.toLowerCase().includes(keyword),
        )
        .slice(0, topK);
      res.json({ items, total: items.length });
      return;
    }

    const result = await knowledgeExtractorService.semanticSearch(query, topK);
    res.json({ items: result, total: result.length });
  }
}

export const knowledgeController = new KnowledgeController();
