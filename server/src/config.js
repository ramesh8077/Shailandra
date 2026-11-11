import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export function configFromEnv() {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(root, '..', 'shalinder-data', 'uploads'));
  const rel = path.relative(root, uploadDir);
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) throw new Error('UPLOAD_DIR must be outside the repository and frontend build');
  const production = process.env.NODE_ENV === 'production';
  const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const secret = process.env.SESSION_SECRET;
  if (production && (!secret || secret.length < 32)) console.error('SESSION_SECRET is missing or too short; a temporary random secret is active and all CMS sessions will reset when this process restarts.');
  if (production && !origin.startsWith('https://')) console.error('Set FRONTEND_ORIGIN to the public HTTPS website origin before enabling CMS writes.');
  return {
    database: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    secret: secret && secret.length >= 32 ? secret : randomBytes(48).toString('hex'),
    uploadDir,
    origin,
    production,
    root,
    frontendDir: path.join(root, 'dist'),
    indexFile: path.join(root, 'dist', 'index.html')
  };
}
