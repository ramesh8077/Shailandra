import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function configFromEnv() {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(root, 'uploads'));
  const production = process.env.NODE_ENV === 'production';
  const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const secret = process.env.SESSION_SECRET;

  if (production && (!secret || secret.length < 32))
    console.error('SESSION_SECRET is missing or too short; a temporary random secret is active.');
  if (production && !origin.startsWith('https://'))
    console.error('Set FRONTEND_ORIGIN to the public HTTPS website origin.');

  return {
    secret: secret && secret.length >= 32 ? secret : randomBytes(48).toString('hex'),
    uploadDir,
    origin,
    production,
    root,
    frontendDir: path.join(root, 'dist'),
    indexFile: path.join(root, 'dist', 'index.html')
  };
}
