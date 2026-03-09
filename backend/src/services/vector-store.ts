import { Pinecone } from '@pinecone-database/pinecone';

import { env } from '../config/env';
import { logger } from '../config/logger';

export interface Vector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStore {
  upsert(vectors: Vector[]): Promise<void>;
  query(vector: number[], topK: number): Promise<QueryResult[]>;
  delete(ids: string[]): Promise<void>;
}

class InMemoryVectorStore implements VectorStore {
  private vectors = new Map<string, Vector>();

  async upsert(vectors: Vector[]): Promise<void> {
    vectors.forEach((vector) => this.vectors.set(vector.id, vector));
  }

  async query(vector: number[], topK: number): Promise<QueryResult[]> {
    const results = Array.from(this.vectors.values()).map((candidate) => ({
      id: candidate.id,
      score: cosineSimilarity(vector, candidate.values),
      metadata: candidate.metadata,
    }));

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async delete(ids: string[]): Promise<void> {
    ids.forEach((id) => this.vectors.delete(id));
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

class PineconeVectorStore implements VectorStore {
  private pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY! });

  async upsert(vectors: Vector[]): Promise<void> {
    if (!env.PINECONE_INDEX) {
      return;
    }

    const index: any = this.pinecone.index(env.PINECONE_INDEX);
    await index.upsert(
      vectors.map((vector) => ({
        id: vector.id,
        values: vector.values,
        metadata: vector.metadata,
      })),
    );
  }

  async query(vector: number[], topK: number): Promise<QueryResult[]> {
    if (!env.PINECONE_INDEX) {
      return [];
    }

    const index: any = this.pinecone.index(env.PINECONE_INDEX);
    const result = await index.query({
      vector,
      topK,
      includeMetadata: true,
    });

    return (result.matches ?? []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      metadata: (match.metadata as Record<string, unknown>) ?? {},
    }));
  }

  async delete(ids: string[]): Promise<void> {
    if (!env.PINECONE_INDEX || ids.length === 0) {
      return;
    }

    const index: any = this.pinecone.index(env.PINECONE_INDEX);
    if (typeof index.deleteMany === 'function') {
      await index.deleteMany(ids);
      return;
    }
    if (typeof index.deleteOne === 'function') {
      await Promise.all(ids.map((id) => index.deleteOne(id)));
    }
  }
}

export function createVectorStore(): VectorStore {
  if (env.PINECONE_API_KEY && env.PINECONE_INDEX) {
    logger.info('Using Pinecone vector store');
    return new PineconeVectorStore();
  }

  logger.info('Using in-memory vector store');
  return new InMemoryVectorStore();
}

export const vectorStore = createVectorStore();
