import { NotFound, Forbidden } from '@openagenda/verror';
import verifyAndLoadAgendaOrUserFromKey from '../api/middleware/verifyAndLoadAgendaOrUserFromKey.js';

// Stub the bits of `req.app` the middleware touches.
//   verified      -> what `auth.verifyKey` resolves to (`{ owner, ... }` | null)
//   noAuth        -> services.auth absent (some test apps mount v2 without it):
//                    the bascule must degrade to the legacy read, not crash.
//   usersByUid    -> resolved by `core.users.get(uid)` (the verify owner rebuild)
//   legacyUser    -> resolved by the legacy `byPublicKey` fallback
//   agendaKey     -> resolved by the legacy `keys(...).get()` fallback
function makeReq({
  headers = {},
  query = {},
  baseUrl = '/v2',
  user,
  verified = null,
  verifyKeyError = null,
  noAuth = false,
  usersByUid = {},
  legacyUser = null,
  byPublicKeyError = null,
  agendaKey = null,
  tokenUser = null,
  byAccessTokenError = null,
} = {}) {
  const get = Object.assign(async (uid) => usersByUid[uid] ?? null, {
    byPublicKey: async () => {
      if (byPublicKeyError) throw byPublicKeyError;
      return legacyUser;
    },
    byAccessToken: async () => {
      if (byAccessTokenError) throw byAccessTokenError;
      return tokenUser;
    },
  });

  const services = {
    keys: () => ({ get: async () => agendaKey }),
    ...!noAuth && {
      auth: {
        verifyKey: async () => {
          if (verifyKeyError) throw verifyKeyError;
          return verified;
        },
      },
    },
  };

  return {
    headers,
    query,
    baseUrl,
    ...user !== undefined && { user },
    app: { services, core: { users: { get } } },
  };
}

// Drive the middleware against a fake res that records status/json, returning
// whether next() ran and what (if anything) was sent.
async function run(req) {
  let nextCalled = false;
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await verifyAndLoadAgendaOrUserFromKey(req, res, () => {
    nextCalled = true;
  });
  return { req, res, nextCalled };
}

describe('90 - api-v2 unit - verifyAndLoadAgendaOrUserFromKey (D3a′)', () => {
  describe('passthrough / delegation', () => {
    it('calls next when req.user is already loaded (session parity)', async () => {
      const { nextCalled, res } = await run(makeReq({ user: { uid: 1 } }));
      expect(nextCalled).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('lets the UI API through anonymously when no key is presented', async () => {
      const { nextCalled } = await run(makeReq({ baseUrl: '/api' }));
      expect(nextCalled).toBe(true);
    });

    it('delegates a tk- access token to the token middleware', async () => {
      const { req, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer tk-valid' },
          tokenUser: { uid: 9 },
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 9 });
    });
  });

  describe('apikey verify path (primary)', () => {
    it('loads a user from a verified key (referenceId = uid)', async () => {
      const { req, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer oa_sk_x' },
          verified: { owner: { kind: 'user', userUid: 42 } },
          usersByUid: { 42: { uid: 42 } },
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 42 });
      expect(req.agendaKey).toBeUndefined();
    });

    it('rebuilds an agenda key (referenceId = agenda:<uid>) as { identifier }', async () => {
      const { req, nextCalled } = await run(
        makeReq({
          query: { key: 'oa_agenda_x' },
          verified: { owner: { kind: 'agenda', agendaUid: 2 } },
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.agendaKey).toEqual({ identifier: 2 });
      expect(req.user).toBeUndefined();
    });

    it('403s a blacklisted user resolved from a verified key', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer oa_sk_x' },
          verified: { owner: { kind: 'user', userUid: 7 } },
          usersByUid: { 7: { uid: 7, isBlacklisted: true } },
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('403s a verified key whose user no longer exists — no legacy fallback', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer oa_sk_x' },
          verified: { owner: { kind: 'user', userUid: 404 } },
          legacyUser: { uid: 404 }, // would resolve, must NOT be consulted
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('legacy drift fallback', () => {
    it('degrades to the legacy read when auth is not wired (guard)', async () => {
      const { req, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer legacy_key' },
          noAuth: true,
          legacyUser: { uid: 99 },
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 99 });
    });

    it('falls back to the legacy read when verifyApiKey misses', async () => {
      const { req, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer legacy_key' },
          verified: null,
          legacyUser: { uid: 99 },
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 99 });
    });

    it('falls back to a full legacy agenda-key row on a verify miss', async () => {
      const row = { id: 5, type: 'agendaFullRead', identifier: 2, key: 'abc' };
      const { req, nextCalled } = await run(
        makeReq({
          query: { key: 'abc' },
          verified: null,
          byPublicKeyError: new NotFound('no such key'),
          agendaKey: row,
        }),
      );
      expect(nextCalled).toBe(true);
      expect(req.agendaKey).toEqual(row);
    });

    it('403s with the loadUserError message when nothing resolves', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          query: { key: 'nope' },
          verified: null,
          byPublicKeyError: new Forbidden('user is blacklisted'),
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('user is blacklisted');
    });
  });
});
