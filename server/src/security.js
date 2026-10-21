import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [salt, hash] = (encoded || '').split(':');
  const actual = await scrypt(password, salt || 'invalid-user-salt', 64);
  return !!hash && hash.length === 128 && timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}
export function problem(status, message) {
  return Object.assign(new Error(message), {
    status
  });
}
export function mediaRefs(value) {
  return [...new Set([...JSON.stringify(value || {}).matchAll(/\/api\/media\/([a-f\d]{24})/g)].map(m => m[1]))];
}
