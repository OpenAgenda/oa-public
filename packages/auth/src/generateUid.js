import { randomInt } from 'node:crypto';

// 2^48 = 281 trillion values — crypto.randomInt's max range, and orders of
// magnitude more than what OA will ever need. user.uid is BIGINT.
export default function generateUid() {
  return randomInt(1, 2 ** 48);
}
