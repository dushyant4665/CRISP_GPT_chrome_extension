import crypto from 'crypto';
export function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
