import { v4 as uuidv4 } from 'uuid';

import { getPrismaClient } from '../config/prisma';
import { renderKnowledgeExtractionPrompt } from '../prompts/knowledge-extraction';
import { astParserService } from './ast-parser';
import { openAIClientService } from './ai/openai-client';
import { vectorStore } from './vector-store';

interface ExtractedNode {
  id: string;
  type: 'function' | 'class' | 'module';
  name: string;
  filePath: string;
  description: string;
  dependencies: string[];
  lineStart: number;
  lineEnd: number;
  codeSnippet: string;
  embedding: number[];
}

function inferLanguage(filePath: string): string {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    return 'typescript';
  }
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    return 'javascript';
  }
  return 'text';
}

function extractSnippet(content: string, startLine: number, endLine: number): string {
  const lines = content.split('\n');
  return lines.slice(startLine - 1, endLine).join('\n');
}

export class KnowledgeExtractorService {
  async extractFromFile(projectId: string, filePath: string, content: string): Promise<ExtractedNode[]> {
    const parsed = astParserService.parseCode(content);

    const entities: Array<Omit<ExtractedNode, 'description' | 'embedding'>> = [
      ...parsed.functions.map((fn) => ({
        id: uuidv4(),
        type: 'function' as const,
        name: fn.name,
        filePath,
        dependencies: parsed.imports,
        lineStart: fn.startLine,
        lineEnd: fn.endLine,
        codeSnippet: extractSnippet(content, fn.startLine, fn.endLine),
      })),
      ...parsed.classes.map((cls) => ({
        id: uuidv4(),
        type: 'class' as const,
        name: cls.name,
        filePath,
        dependencies: parsed.imports,
        lineStart: cls.startLine,
        lineEnd: cls.endLine,
        codeSnippet: extractSnippet(content, cls.startLine, cls.endLine),
      })),
    ];

    const withDescriptions: ExtractedNode[] = [];

    for (const entity of entities) {
      const prompt = renderKnowledgeExtractionPrompt(filePath, inferLanguage(filePath), entity.codeSnippet);
      const description = await openAIClientService.chat([
        { role: 'system', content: 'You are a code knowledge extraction assistant.' },
        { role: 'user', content: prompt },
      ]);

      const embedding = await openAIClientService.createEmbedding(
        `${entity.name}\n${description}\n${entity.codeSnippet}`,
      );

      withDescriptions.push({
        ...entity,
        description,
        embedding,
      });
    }

    await vectorStore.upsert(
      withDescriptions.map((node) => ({
        id: node.id,
        values: node.embedding,
        metadata: {
          projectId,
          filePath: node.filePath,
          name: node.name,
          type: node.type,
        },
      })),
    );

    const prisma = getPrismaClient();
    if (prisma) {
      for (const node of withDescriptions) {
        await prisma.knowledgeNode.upsert({
          where: { id: node.id },
          create: {
            id: node.id,
            projectId,
            nodeType: node.type,
            name: node.name,
            filePath: node.filePath,
            lineStart: node.lineStart,
            lineEnd: node.lineEnd,
            description: node.description,
            codeSnippet: node.codeSnippet,
            metadata: { dependencies: node.dependencies },
          },
          update: {
            description: node.description,
            codeSnippet: node.codeSnippet,
            metadata: { dependencies: node.dependencies },
          },
        });
      }
    }

    return withDescriptions;
  }

  async semanticSearch(query: string, topK = 10) {
    const vector = await openAIClientService.createEmbedding(query);
    return vectorStore.query(vector, topK);
  }
}

export const knowledgeExtractorService = new KnowledgeExtractorService();
