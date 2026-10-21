import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export function configFromEnv() {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(root, '..', 'shalinder-data', 'uploads'));
  const rel = path.relative(root, uploadDir);
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) throw new Error('UPLOAD_DIR must be outside the repository and frontend build');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 random characters');
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  const production = process.env.NODE_ENV === 'production';
  const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  if (production && !origin.startsWith('https://')) throw new Error('HTTPS FRONTEND_ORIGIN required');
  return {
    mongoUri: process.env.MONGODB_URI,
    secret: process.env.SESSION_SECRET,
    uploadDir,
    origin,
    production
  };
}
