import OpenAI from 'openai';

import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { renderCodeReviewPrompt } from '../../prompts/code-review';
import { ReviewParams, ReviewReport } from '../../types/review';
import { withRetry } from '../../utils/retry';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function safeJsonParse<T>(payload: string): T | null {
  try {
    return JSON.parse(payload) as T;
  } catch {
    const maybeJson = payload.match(/\{[\s\S]*\}/)?.[0];
    if (!maybeJson) {
      return null;
    }
    try {
      return JSON.parse(maybeJson) as T;
    } catch {
      return null;
    }
  }
}

function buildFallbackReview(params: ReviewParams): ReviewReport {
  const riskLevel = /password|token|secret|sql|eval/i.test(params.diff) ? 'high' : 'medium';
  return {
    summary: `Auto fallback review for ${params.prTitle}`,
    riskLevel,
    issues: [
      {
        file: 'unknown',
        line: 1,
        severity: 'warning',
        category: 'maintainability',
        message: 'OpenAI API key missing, fallback review generated.',
        suggestion: 'Configure OPENAI_API_KEY for real semantic review.',
      },
    ],
    suggestions: ['Add OPENAI_API_KEY and rerun review for full analysis.'],
    relatedPRs: [],
  };
}

export class OpenAIClientService {
  private client: OpenAI | null;

  constructor() {
    this.client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
  }

  async reviewCode(params: ReviewParams): Promise<ReviewReport> {
    if (!this.client) {
      return buildFallbackReview(params);
    }

    const prompt = renderCodeReviewPrompt(params);

    const result = await withRetry(
      async () => {
        const response = await this.client!.responses.create({
          model: env.OPENAI_MODEL,
          input: prompt,
          temperature: 0.3,
          max_output_tokens: 2000,
        });

        const text = response.output_text;
        const parsed = safeJsonParse<ReviewReport>(text);
        if (!parsed) {
          throw new Error('OpenAI response is not valid JSON');
        }
        return parsed;
      },
      {
        retries: 3,
        minDelayMs: 1000,
        shouldRetry(error) {
          const message = String(error);
          return /429|rate|timeout|ECONNRESET/i.test(message);
        },
      },
    );

    return result;
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!this.client) {
      return Array.from({ length: 12 }, (_, i) => (text.length + i) % 7);
    }

    const response = await this.client.embeddings.create({
      model: env.OPENAI_EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0]?.embedding ?? [];
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.client) {
      return 'OpenAI API key is not configured.';
    }

    try {
      const response = await this.client.responses.create({
        model: env.OPENAI_MODEL,
        input: messages.map((message) => `${message.role}: ${message.content}`).join('\n'),
      });
      return response.output_text;
    } catch (error) {
      logger.error('OpenAI chat failed', { error: String(error) });
      throw error;
    }
  }
}

export const openAIClientService = new OpenAIClientService();
