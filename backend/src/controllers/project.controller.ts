import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../config/env';
import { getPrismaClient } from '../config/prisma';
import { mockStore } from '../services/mock-data';

export class ProjectController {
  async list(req: Request, res: Response): Promise<void> {
    if (env.USE_MOCK_DATA) {
      res.json(mockStore.projects);
      return;
    }

    const prisma = getPrismaClient();
    const projects = await prisma!.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  }

  async get(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (env.USE_MOCK_DATA) {
      const project = mockStore.findProject(id);
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      res.json(project);
      return;
    }

    const project = await getPrismaClient()!.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  }

  async create(req: Request, res: Response): Promise<void> {
    const payload = req.body as {
      githubRepoId: number;
      name: string;
      fullName: string;
      owner: string;
      defaultBranch?: string;
    };

    if (env.USE_MOCK_DATA) {
      const project = {
        id: uuidv4(),
        githubRepoId: BigInt(payload.githubRepoId),
        name: payload.name,
        fullName: payload.fullName,
        owner: payload.owner,
        defaultBranch: payload.defaultBranch ?? 'main',
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.projects.push(project);
      res.status(201).json(project);
      return;
    }

    const project = await getPrismaClient()!.project.create({
      data: {
        githubRepoId: BigInt(payload.githubRepoId),
        name: payload.name,
        fullName: payload.fullName,
        owner: payload.owner,
        defaultBranch: payload.defaultBranch ?? 'main',
      },
    });

    res.status(201).json(project);
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const config = req.body;

    if (env.USE_MOCK_DATA) {
      const project = mockStore.findProject(id);
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      project.config = config;
      project.updatedAt = new Date();
      res.json(project);
      return;
    }

    const updated = await getPrismaClient()!.project.update({
      where: { id },
      data: { config },
    });

    res.json(updated);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (env.USE_MOCK_DATA) {
      const index = mockStore.projects.findIndex((project) => project.id === id);
      if (index === -1) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      mockStore.projects.splice(index, 1);
      res.status(204).send();
      return;
    }

    await getPrismaClient()!.project.delete({ where: { id } });
    res.status(204).send();
  }
}

export const projectController = new ProjectController();
