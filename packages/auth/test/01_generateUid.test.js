import generateUid from '../src/generateUid.js';

describe('auth - unit: generateUid', () => {
  it('returns a positive integer in the safe range', () => {
    const uid = generateUid();
    expect(Number.isInteger(uid)).toBe(true);
    expect(uid).toBeGreaterThanOrEqual(1);
    expect(uid).toBeLessThan(Number.MAX_SAFE_INTEGER);
  });
});
