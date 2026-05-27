import { NotFound, Forbidden } from '@openagenda/verror';
import createAuthenticate from '../api-v3/lib/authenticate.js';

// Stub `core` exposing only what authenticate touches. Each resolver is driven
// by the options so a test can make it return a value or throw a typed error.
function makeCore({
  user = null,
  tokenUser = null,
  agendaKey = null,
  byPublicKeyError = null,
  byAccessTokenError = null,
} = {}) {
  return {
    services: {
      keys: () => ({
        get: async () => agendaKey,
      }),
    },
    users: {
      get: {
        byPublicKey: async () => {
          if (byPublicKeyError) throw byPublicKeyError;
          return user;
        },
        byAccessToken: async () => {
          if (byAccessTokenError) throw byAccessTokenError;
          return tokenUser;
        },
      },
    },
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
});
