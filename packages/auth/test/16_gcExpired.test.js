import { jest } from '@jest/globals';
import gcExpired from '../src/gcExpired.js';

// gcExpired is pure over the better-auth adapter, so we drive it with a mock
// adapter — no DB. We assert WHICH models/fields/operators it targets (the
// contract that must not silently drift) and the trusted-client carve-out.

const NOW_OK = (v) => v instanceof Date && !Number.isNaN(v.getTime());

function makeAdapter({
  deleteCounts = {},
  consents = {},
  candidates = [],
} = {}) {
  const calls = { deleteMany: [], findMany: [], count: [] };
  return {
    calls,
    deleteMany: jest.fn(async ({ model, where }) => {
      calls.deleteMany.push({ model, where });
      return deleteCounts[model] ?? 0;
    }),
    findMany: jest.fn(async ({ model, where, limit }) => {
      calls.findMany.push({ model, where, limit });
      return candidates;
    }),
    count: jest.fn(async ({ model, where }) => {
      calls.count.push({ model, where });
      const clientId = where[0].value;
      return consents[clientId] ?? 0;
    }),
  };
}

describe('auth - gcExpired (adapter contract)', () => {
  it('deletes expired sessions, verifications and OAuth tokens via `expiresAt < now`', async () => {
    const adapter = makeAdapter({
      deleteCounts: {
        session: 5,
        verification: 4,
        oauthAccessToken: 3,
        oauthRefreshToken: 2,
      },
    });
    const res = await gcExpired(adapter, { olderThanDays: 30 });

    const expiryModels = [
      'session',
      'verification',
      'oauthAccessToken',
      'oauthRefreshToken',
    ];
    const models = adapter.calls.deleteMany.map((c) => c.model);
    expect(models).toEqual(expect.arrayContaining(expiryModels));
    for (const model of expiryModels) {
      const call = adapter.calls.deleteMany.find((c) => c.model === model);
      expect(call.where[0].field).toBe('expiresAt');
      expect(call.where[0].operator).toBe('lt');
      expect(NOW_OK(call.where[0].value)).toBe(true);
    }
    expect(res).toMatchObject({
      sessions: 5,
      verifications: 4,
      accessTokens: 3,
      refreshTokens: 2,
    });
  });

  it('reaps an old client with no consent, keeps one that was approved', async () => {
    const adapter = makeAdapter({
      candidates: [{ clientId: 'unused' }, { clientId: 'approved' }],
      consents: { approved: 1, unused: 0 },
      deleteCounts: { oauthClient: 1 },
    });
    const res = await gcExpired(adapter, { olderThanDays: 30 });

    // Candidates are old clients (createdAt < cutoff).
    const find = adapter.calls.findMany.find((c) => c.model === 'oauthClient');
    expect(find.where[0]).toMatchObject({ field: 'createdAt', operator: 'lt' });

    // Only the unused client is deleted, by id.
    const del = adapter.calls.deleteMany.find((c) => c.model === 'oauthClient');
    expect(del.where[0]).toMatchObject({ field: 'clientId', operator: 'in' });
    expect(del.where[0].value).toEqual(['unused']);
    expect(res.clients).toBe(1);
  });

  it('never reaps a trusted client (no consent lookup, no delete)', async () => {
    const adapter = makeAdapter({
      candidates: [{ clientId: 'first-party' }],
      consents: {}, // trusted clients have no consent row
    });
    const res = await gcExpired(adapter, {
      trustedClients: [{ clientId: 'first-party' }],
    });

    // Trusted clients are short-circuited — no consent count, no client delete.
    expect(adapter.calls.count).toHaveLength(0);
    expect(
      adapter.calls.deleteMany.some((c) => c.model === 'oauthClient'),
    ).toBe(false);
    expect(res.clients).toBe(0);
  });

  it('does not issue a client delete when nothing is unused', async () => {
    const adapter = makeAdapter({
      candidates: [{ clientId: 'approved' }],
      consents: { approved: 2 },
    });
    await gcExpired(adapter, {});
    expect(
      adapter.calls.deleteMany.some((c) => c.model === 'oauthClient'),
    ).toBe(false);
  });
});
