import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default('info'),
  USE_MOCK_DATA: z
    .union([z.string(), z.boolean()])
    .transform((value) => value === true || value === 'true')
    .default(true),

  DATABASE_URL: z.string().default('postgresql://codesage:codesage@localhost:5432/codesage?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  GITHUB_APP_ID: z.string().optional(),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().default('dev_webhook_secret'),
  GITHUB_INSTALLATION_ID: z.coerce.number().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(45000),

  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),

  SLACK_WEBHOOK_URL: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const errorMessage = parsed.error.issues.map((issue) => issue.message).join('; ');
  throw new Error(`Invalid environment variables: ${errorMessage}`);
}

export const env = parsed.data;
