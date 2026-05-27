import { NotFound, Forbidden } from '@openagenda/verror';
import createAuthenticate from '../api-v3/lib/authenticate.js';

// Stub `core` exposing only what authenticate touches. Each resolver is driven
// by the options so a test can make it return a value or throw a typed error.
//
//   verified     -> the normalized descriptor `auth.verifyKey` resolves to
//                   (`{ owner, oaKind, ... }`) or null. D3a verifies the apikey
//                   store first; `null` means a miss that falls through to the
//                   legacy `byPublicKey`/`keys` read. The referenceId→owner
//                   normalization itself is unit-tested in @openagenda/auth.
//   usersByUid   -> map keyed by uid, resolved by `core.users.get(uid)` (the
//                   D3a owner rebuild). Distinct from the legacy `byPublicKey`.
function makeCore({
  user = null,
  tokenUser = null,
  agendaKey = null,
  byPublicKeyError = null,
  byAccessTokenError = null,
  verified = null,
  verifyKeyError = null,
  usersByUid = {},
} = {}) {
  const get = Object.assign(async (uid) => usersByUid[uid] ?? null, {
    byPublicKey: async () => {
      if (byPublicKeyError) throw byPublicKeyError;
      return user;
    },
    byAccessToken: async () => {
      if (byAccessTokenError) throw byAccessTokenError;
      return tokenUser;
    },
  });

  return {
    services: {
      keys: () => ({
        get: async () => agendaKey,
      }),
      auth: {
        verifyKey: async () => {
          if (verifyKeyError) throw verifyKeyError;
          return verified;
        },
      },
    },
    users: { get },
  };
}

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

    it('rejects a public key that resolves to neither user nor agenda', async () => {
      const core = makeCore({ byPublicKeyError: new NotFound('invalid key') });
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
    it('lets an unexpected public-key error surface (→ 500) instead of 401', async () => {
      const boom = new Error('user lookup blew up');
      const core = makeCore({ byPublicKeyError: boom });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      // Only a typed NotFound falls through to the agenda-key lookup; anything
      // else reaches the handler unchanged (→ generic 500), it is NOT swallowed
      // and re-reported as a 401.
      expect(error).toBe(boom);
      expect(error?.name).not.toBe('NotAuthenticated');
    });
  });

  describe('403 Forbidden (blacklist)', () => {
    it('surfaces a blacklist Forbidden from the public-key path as 403, not 401', async () => {
      const core = makeCore({
        byPublicKeyError: new Forbidden('user is blacklisted'),
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
  });

  describe('success', () => {
    it('loads a user from a Bearer public key', async () => {
      const core = makeCore({ user: { uid: 42 } });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_ok' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('loads a user from a ?key= query param', async () => {
      const core = makeCore({ user: { uid: 42 } });
      const { error, req } = await run(core, { query: { key: 'abc' } });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('loads a user from a `key` header', async () => {
      const core = makeCore({ user: { uid: 42 } });
      const { error, req } = await run(core, { headers: { key: 'abc' } });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
    });

    it('falls back to an agenda key when the public key is not a user', async () => {
      const core = makeCore({
        byPublicKeyError: new NotFound('invalid key'),
        agendaKey: { identifier: 2, key: 'abc' },
      });
      const { error, req } = await run(core, { query: { key: 'abc' } });
      expect(error).toBeUndefined();
      expect(req.agendaKey).toEqual({ identifier: 2, key: 'abc' });
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

  // D3a — the apikey store is the primary read path: verifyApiKey resolves the
  // key, the OA owner is rebuilt from the referenceId (core.users.get for a
  // user, a bare { identifier } for an agenda). Behaviour parity with the legacy
  // path — no tier enforcement here (that's D6); pk and sk both load the user.
  describe('apikey verify path (primary)', () => {
    it('loads a user from a verified pk key (referenceId = uid)', async () => {
      const core = makeCore({
        verified: verifiedUser(42, 'pk'),
        usersByUid: { 42: { uid: 42 } },
      });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 42 });
      expect(req.agendaKey).toBeUndefined();
    });

    it('loads a user from a verified sk key (parity — sk also loads the user)', async () => {
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

    it('rebuilds an agenda key from a verified agenda: referenceId', async () => {
      const core = makeCore({ verified: verifiedAgenda(2) });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_agenda_x' },
      });
      expect(error).toBeUndefined();
      expect(req.agendaKey).toEqual({ identifier: 2 });
      expect(req.user).toBeUndefined();
    });

    it('rejects a blacklisted user resolved from a verified key (403)', async () => {
      const core = makeCore({
        verified: verifiedUser(7, 'sk'),
        usersByUid: { 7: { uid: 7, isBlacklisted: true } },
      });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_sk_x' },
      });
      expect(error?.name).toBe('Forbidden');
    });

    it('lets a verifyApiKey infra fault surface (→ 500), not masked as 401', async () => {
      const boom = new Error('apikey store unreachable');
      const core = makeCore({ verifyKeyError: boom });
      const { error } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error).toBe(boom);
      expect(error?.name).not.toBe('NotAuthenticated');
    });

    it('falls back to the legacy read when verifyApiKey misses', async () => {
      // valid:false (default) → drift fallback finds the user via byPublicKey.
      const core = makeCore({ user: { uid: 99 } });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_legacy' },
      });
      expect(error).toBeUndefined();
      expect(req.user).toEqual({ uid: 99 });
    });

    it('rejects (401) a verified key whose user no longer exists — no fallback', async () => {
      // verify resolved the key (it IS in the store) but the uid is gone
      // (usersByUid empty). A verified key is not a drift miss, so the legacy
      // tables must NOT be re-queried — it's a straight 401. The legacy user is
      // wired here precisely to assert it is never consulted.
      const core = makeCore({
        verified: verifiedUser(404, 'pk'),
        user: { uid: 404 },
      });
      const { error, req } = await run(core, {
        headers: { authorization: 'Bearer oa_pk_x' },
      });
      expect(error?.name).toBe('NotAuthenticated');
      expect(req.user).toBeUndefined();
    });
  });
});
