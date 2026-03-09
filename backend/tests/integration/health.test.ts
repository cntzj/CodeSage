import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app';

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
