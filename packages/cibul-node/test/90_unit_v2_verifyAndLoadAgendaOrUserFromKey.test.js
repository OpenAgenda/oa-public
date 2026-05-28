import verifyAndLoadAgendaOrUserFromKey from '../api/middleware/verifyAndLoadAgendaOrUserFromKey.js';

// Stub the bits of `req.app` the middleware touches.
//   verified      -> what `auth.verifyKey` resolves to (`{ owner, ... }` | null)
//   noAuth        -> services.auth absent (some test apps mount v2 without it):
//                    no key path is reachable, requests fail closed (403).
//   usersByUid    -> resolved by `core.users.get(uid)` (the verify owner rebuild)
function makeReq({
  headers = {},
  query = {},
  baseUrl = '/v2',
  user,
  verified = null,
  verifyKeyError = null,
  noAuth = false,
  usersByUid = {},
  tokenUser = null,
  byAccessTokenError = null,
} = {}) {
  const get = Object.assign(async (uid) => usersByUid[uid] ?? null, {
    byAccessToken: async () => {
      if (byAccessTokenError) throw byAccessTokenError;
      return tokenUser;
    },
  });

  const services = {
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

describe('90 - api-v2 unit - verifyAndLoadAgendaOrUserFromKey', () => {
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

  describe('apikey verify path', () => {
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

    it('403s a verified key whose user no longer exists', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer oa_sk_x' },
          verified: { owner: { kind: 'user', userUid: 404 } },
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('403s when verifyKey returns null (no legacy fallback since D5)', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer unknown_key' },
          verified: null,
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('403s when auth is not wired and a key is presented', async () => {
      const { res, nextCalled } = await run(
        makeReq({
          headers: { authorization: 'Bearer legacy_key' },
          noAuth: true,
        }),
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });
  });
});
