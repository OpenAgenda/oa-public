import { Forbidden } from '@openagenda/verror';
import createAuthenticate from '../api-v3/lib/authenticate.js';

// Stub `core` exposing only what authenticate touches. Each resolver is driven
// by the options so a test can make it return a value or throw a typed error.
//
//   verified     -> the normalized descriptor `auth.verifyKey` resolves to
//                   (`{ owner, oaKind, ... }`) or null. The apikey store is the
//                   single source of truth since D5a — no legacy fallback.
//   usersByUid   -> map keyed by uid, resolved by `core.users.get(uid)` (owner
//                   rebuild from the verified key's referenceId).
function makeCore({
  tokenUser = null,
  byAccessTokenError = null,
  verified = null,
  verifyKeyError = null,
  oauthVerified = null,
  verifyOAuthError = null,
  usersByUid = {},
} = {}) {
  const get = Object.assign(async (uid) => usersByUid[uid] ?? null, {
    byAccessToken: async () => {
      if (byAccessTokenError) throw byAccessTokenError;
      return tokenUser;
    },
  });

  return {
    services: {
      auth: {
        verifyKey: async () => {
          if (verifyKeyError) throw verifyKeyError;
          return verified;
        },
        verifyOAuthAccessToken: async () => {
          if (verifyOAuthError) throw verifyOAuthError;
          return oauthVerified;
        },
      },
    },
    users: { get },
  };
}

// A syntactically valid JWS (three base64url segments) so the middleware routes
// it to the OAuth path; the mocked verifier decides accept/reject, not the shape.
const JWT = 'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0MiJ9.c2ln';

// Shape an `auth.verifyKey` descriptor for a user or agenda owner.
function verifiedUser(uid, oaKind = 'pk') {
  return {
    owner: { kind: 'user', userUid: uid },
    oaKind,
    referenceId: String(uid),
  };
}
function verifiedAgenda(uid) {
  return {
    owner: { kind: 'agenda', agendaUid: uid },
    oaKind: 'agenda',
    referenceId: `agenda:${uid}`,
  };
}

// Run the middleware against a fake request, returning whatever it passed to
// `next` (an error or undefined) plus the mutated request.
async function run(core, { headers = {}, query = {} } = {}) {
  const req = { headers, query };
  let nextArg;
  let called = false;
  await createAuthenticate(core)(req, {}, (arg) => {
    called = true;
    nextArg = arg;
  });
  if (!called) {
    throw new Error('middleware did not call next');
  }
  return { error: nextArg, req };
}

describe('90 - api-v3 unit - authenticate', () => {
  describe('401 NotAuthenticated', () => {
    it('rejects a request with no credentials', async () => {
      const { error } = await run(makeCore(), {});
      expect(error?.name).toBe('NotAuthenticated');
    });

    it('rejects a public key that verifyKey does not recognize', async () => {
      const core = makeCore({ verified: null });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_unknown' },
      });
      expect(error?.name).toBe('NotAuthenticated');
    });

    it('rejects an invalid or expired access token', async () => {
      // The legacy tk- primitives throw a plain Error for a bad/expired token.
      const core = makeCore({
        byAccessTokenError: new Error('access token is invalid'),
      });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer tk-nope' },
      });
      expect(error?.name).toBe('NotAuthenticated');
    });
  });

  describe('unexpected errors propagate (not masked as 401)', () => {
    it('lets a verifyKey infra fault surface (→ 500), not masked as 401', async () => {
      const boom = new Error('apikey store unreachable');
      const core = makeCore({ verifyKeyError: boom });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error).toBe(boom);
      expect(error?.name).not.toBe('NotAuthenticated');
    });
  });

  describe('403 Forbidden (blacklist)', () => {
    it('rejects a blacklisted user resolved from a verified key', async () => {
      const core = makeCore({
        verified: verifiedUser(7, 'sk'),
        usersByUid: { 7: { uid: 7, isBlacklisted: true } },
      });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_sk_x' },
      });
      expect(error?.name).toBe('Forbidden');
    });

    it('rejects a blacklisted pk owner (blacklist is checked before the public lock)', async () => {
      const core = makeCore({
        verified: verifiedUser(7, 'pk'),
        usersByUid: { 7: { uid: 7, isBlacklisted: true } },
      });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error?.name).toBe('Forbidden');
    });

    it('rejects a blacklisted user resolved from an access token', async () => {
      const core = makeCore({ tokenUser: { uid: 7, isBlacklisted: true } });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer tk-valid' },
      });
      expect(error?.name).toBe('Forbidden');
    });

    it('rethrows Forbidden raised from byAccessToken (never mask as 401)', async () => {
      const core = makeCore({
        byAccessTokenError: new Forbidden('user is blacklisted'),
      });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer tk-blacklisted' },
      });
      expect(error?.name).toBe('Forbidden');
    });
  });

  // Single source of truth = the better-auth `apikey` store. verifyKey resolves
  // the key, the OA owner is rebuilt from the referenceId (core.users.get for a
  // user, a bare { identifier } for an agenda). D6.A tier enforcement (v3): a pk
  // resolves its owner (existence + blacklist) but does NOT attach req.user (the
  // structural public lock); an sk authenticates as the owner.
  describe('apikey verify path', () => {
    it('does NOT attach req.user for a pk key (structural public lock)', async () => {
      const core = makeCore({
        verified: verifiedUser(42, 'pk'),
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error).toBeUndefined();
      // Owner resolved and carried, but visibility withheld: no userUid flows to
      // core, so the search runs published-only / public-fields.
      expect(req.user).toBeUndefined();
      expect(req.apiKey?.owner).toEqual({ kind: 'user', userUid: 42 });
      expect(req.agendaKey).toBeUndefined();
    });

    it('authenticates as the owner for an sk key (userUid flows to core)', async () => {
      const core = makeCore({
        verified: verifiedUser(42, 'sk'),
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_sk_x' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('loads a user from a ?key= query param (sk)', async () => {
      const core = makeCore({
        verified: verifiedUser(42, 'sk'),
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, { query: { key: 'abc' } });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('loads a user from a `key` header (sk)', async () => {
      const core = makeCore({
        verified: verifiedUser(42, 'sk'),
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, { headers: { key: 'abc' } });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('rebuilds an agenda key from a verified agenda: referenceId', async () => {
      const core = makeCore({ verified: verifiedAgenda(2) });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_agenda_x' },
      });
      expect(error).toBeUndefined();
      expect(req.agendaKey).toEqual({ identifier: 2 });
      expect(req.user).toBeUndefined();
    });

    it('rejects (401) a verified key whose user no longer exists', async () => {
      const core = makeCore({ verified: verifiedUser(404, 'pk') });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error?.name).toBe('NotAuthenticated');
      expect(req.user).toBeUndefined();
    });

    it('loads a user from a legacy tk- access token', async () => {
      const core = makeCore({ tokenUser: { uid: 9 } });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer tk-valid' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 9 });
    });

    it('loads a user from the access-token header', async () => {
      const core = makeCore({ tokenUser: { uid: 9 } });
      const { error, req } = await run(core, {
        headers: { 'access-token': 'tk-valid' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 9 });
    });

    it('authenticates as the user for a valid OAuth token (delegation)', async () => {
      const core = makeCore({
        oauthVerified: {
          userUid: 42,
          scopes: ['openid', 'events:read'],
          clientId: 'mcp-client',
        },
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
      expect(req.oauth).toEqual({
        scopes: ['openid', 'events:read'],
        clientId: 'mcp-client',
      });
    });

    it('rejects (401) an invalid/expired OAuth token', async () => {
      const core = makeCore({ oauthVerified: null });
      const { error, req } = await run(core, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(error?.name).toBe('NotAuthenticated');
      expect(req.user).toBeUndefined();
    });

    it('rejects (401) an OAuth token whose user no longer exists', async () => {
      const core = makeCore({ oauthVerified: { userUid: 404, scopes: [] } });
      const { error } = await run(core, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(error?.name).toBe('NotAuthenticated');
    });

    it('rejects (403) a blacklisted user behind a valid OAuth token', async () => {
      const core = makeCore({
        oauthVerified: { userUid: 7, scopes: [] },
        usersByUid: { 7: { uid: 7, isBlacklisted: true } },
      });
      const { error } = await run(core, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(error?.name).toBe('Forbidden');
    });

    it('passes through when req.user is already set (browser session parity)', async () => {
      const core = makeCore();
      const req = { headers: {}, query: {}, user: { uid: 1 } };
      let nextArg;
      await createAuthenticate(core)(req, {}, (arg) => {
        nextArg = arg;
      });
      expect(nextArg).toBeUndefined();
      expect(req.user).toEqual({ uid: 1 });
    });
  });
});
