import { randomBytes } from 'node:crypto';

export default function generateNonce(): string {
  return randomBytes(16).toString('base64');
}
