import crypto, { randomUUID } from 'node:crypto';

export { randomUUID };

export function randomHash(length = 32) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  let salt = '';

  for (let i = 0; i < length; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)];
  }

  return salt;
}

export function hashPassword(password, salt) {
  return crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex');
}

export function verifyPassword(hashedPassword, password, salt, sha1) {
  return (
    hashedPassword
    === crypto
      .createHash(sha1 ? 'sha1' : 'sha256')
      .update(salt + password, 'utf-8')
      .digest('hex')
  );
}
