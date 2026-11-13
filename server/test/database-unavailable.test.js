import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('auth/me returns the public CMS-unavailable response when the database is not ready', async () => {
  const app = createApp({
    origin: 'https://example.test',
    secret: 'test-only-secret-with-at-least-32-characters',
    production: false,
    frontendDir: '/tmp/cms-test-dist',
    indexFile: '/tmp/cms-test-dist/index.html'
  });

  const response = await request(app).get('/api/auth/me');

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, {
    error: {
      message: 'CMS database is temporarily unavailable. The public website is still available.'
    }
  });
});
