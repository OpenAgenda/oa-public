import { jest } from '@jest/globals';
import { revokeUserGrants, isUserActiveByUid } from '../src/oauthGrants.js';

// Both helpers are pure over the better-auth model-aware adapter, so we drive
// them with a mock adapter — no DB. We assert WHICH models/fields/operators they
// target (the contract that must not silently drift) and the fail-closed posture
// of the active check.

const NOW_OK = (v) => v instanceof Date && !Number.isNaN(v.getTime());

function makeAdapter({ deleteCounts = {}, updateCount = 0, user } = {}) {
  const calls = { deleteMany: [], updateMany: [], findOne: [] };
  return {
    calls,
    deleteMany: jest.fn(async ({ model, where }) => {
      calls.deleteMany.push({ model, where });
      return deleteCounts[model] ?? 0;
    }),
    updateMany: jest.fn(async ({ model, where, update }) => {
      calls.updateMany.push({ model, where, update });
      return updateCount;
    }),
    findOne: jest.fn(async ({ model, where }) => {
      calls.findOne.push({ model, where });
      return user ?? null;
    }),
  };
}

describe('auth - revokeUserGrants (adapter contract)', () => {
  it('drops consents + access tokens and marks refresh tokens revoked, all by userId', async () => {
    const adapter = makeAdapter({
      deleteCounts: { oauthConsent: 2, oauthAccessToken: 3 },
      updateCount: 1,
    });
    const res = await revokeUserGrants(adapter, 42);

    const consent = adapter.calls.deleteMany.find(
      (c) => c.model === 'oauthConsent',
    );
    const access = adapter.calls.deleteMany.find(
      (c) => c.model === 'oauthAccessToken',
    );
    const refresh = adapter.calls.updateMany.find(
      (c) => c.model === 'oauthRefreshToken',
    );

    // Every operation keys on the user id (stringified, matching the rest of the
    // facade), via the logical `userId` field.
    for (const call of [consent, access, refresh]) {
      expect(call.where[0]).toMatchObject({
        field: 'userId',
        operator: 'eq',
        value: '42',
      });
    }
    // Refresh tokens are marked revoked with a real timestamp (not deleted).
    expect(refresh.update.revoked).toBeDefined();
    expect(NOW_OK(refresh.update.revoked)).toBe(true);
    // Refresh tokens are never deleted — only revoked.
    expect(
      adapter.calls.deleteMany.some((c) => c.model === 'oauthRefreshToken'),
    ).toBe(false);

    expect(res).toEqual({ consents: 2, refreshTokens: 1, accessTokens: 3 });
  });

  it('coerces a non-number count to null (defensive, like gcExpired)', async () => {
    const adapter = makeAdapter();
    adapter.deleteMany.mockResolvedValue(undefined);
    adapter.updateMany.mockResolvedValue(undefined);
    const res = await revokeUserGrants(adapter, 7);
    expect(res).toEqual({
      consents: null,
      refreshTokens: null,
      accessTokens: null,
    });
  });
});

describe('auth - isUserActiveByUid (fail-closed)', () => {
  it('reads the user row by `uid` and returns true for an active user', async () => {
    const adapter = makeAdapter({
      user: { id: 1, uid: 99, isRemoved: false, isBlacklisted: false },
    });
    const active = await isUserActiveByUid(adapter, 99);
    expect(active).toBe(true);
    expect(adapter.calls.findOne[0]).toMatchObject({
      model: 'user',
      where: [{ field: 'uid', operator: 'eq', value: 99 }],
    });
  });

  it('returns false for a removed user', async () => {
    const adapter = makeAdapter({
      user: { uid: 99, isRemoved: true, isBlacklisted: false },
    });
    expect(await isUserActiveByUid(adapter, 99)).toBe(false);
  });

  it('returns false for a blacklisted user', async () => {
    const adapter = makeAdapter({
      user: { uid: 99, isRemoved: false, isBlacklisted: true },
    });
    expect(await isUserActiveByUid(adapter, 99)).toBe(false);
  });

  it('fails closed for a missing user row', async () => {
    const adapter = makeAdapter({ user: null });
    expect(await isUserActiveByUid(adapter, 12345)).toBe(false);
  });
});
