import verifyAndLoadOAuthUser from '../api/middleware/verifyAndLoadOAuthUser.js';
import {
  requireScope,
  denyOAuthScope,
  denyUncheckedOAuthScope,
} from '../api/middleware/oauthScope.js';

// A syntactically valid JWS (three base64url segments) so the middleware routes
// it to the OAuth path; the mocked verifier decides accept/reject, not the shape.
const JWT = 'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0MiJ9.c2ln';

// Build the `req.app` stub verifyAndLoadOAuthUser reaches into:
//   services.auth.verifyOAuthAccessToken -> descriptor or null
//   core.users.get(uid)                  -> user or null
function makeApp({
  auth = undefined,
  oauthVerified = null,
  verifyOAuthError = null,
  usersByUid = {},
} = {}) {
  return {
    services: {
      auth:
        auth === undefined
          ? {
            verifyOAuthAccessToken: async () => {
              if (verifyOAuthError) throw verifyOAuthError;
              return oauthVerified;
            },
          }
          : auth,
    },
    core: { users: { get: async (uid) => usersByUid[uid] ?? null } },
  };
}

// Capturing res + next. Returns what the middleware did: either it wrote a
// response (status/body/headers) or it called next (nextCalled true).
function makeCapture() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
  const state = { nextCalled: false, nextArg: undefined };
  const next = (err) => {
    state.nextCalled = true;
    state.nextArg = err;
  };
  return { res, next, state };
}

async function runOAuth(app, { headers = {}, query = {}, user } = {}) {
  const req = { headers, query, app };
  if (user !== undefined) req.user = user;
  const { res, next, state } = makeCapture();
  await verifyAndLoadOAuthUser(req, res, next);
  return { req, res, nextCalled: state.nextCalled, nextArg: state.nextArg };
}

// Run a scope middleware against a bare req, returning the capture + the req
// (so a test can assert req.oauthScopeChecked).
function runMw(mw, req) {
  const { res, next, state } = makeCapture();
  mw(req, res, next);
  return { req, res, nextCalled: state.nextCalled };
}

describe('91 - api-v2 unit - verifyAndLoadOAuthUser', () => {
  describe('no-op pass-through (legacy callers untouched)', () => {
    it('passes through when no Authorization header', async () => {
      const { res, nextCalled } = await runOAuth(makeApp());
      expect(nextCalled).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('passes through a non-JWT bearer (api key)', async () => {
      const { nextCalled, req } = await runOAuth(makeApp(), {
        headers: { authorization: 'Bearer oa_sk_abc' },
      });
      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it('passes through a legacy tk- access token', async () => {
      const { nextCalled, req } = await runOAuth(makeApp(), {
        headers: { authorization: 'Bearer tk-abc' },
      });
      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it('passes through when req.user is already resolved', async () => {
      const { nextCalled, req } = await runOAuth(makeApp(), {
        headers: { authorization: `Bearer ${JWT}` },
        user: { uid: 1 },
      });
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 1 });
    });

    it('degrades to next when the auth service is absent', async () => {
      const { nextCalled } = await runOAuth(makeApp({ auth: null }), {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(nextCalled).toBe(true);
    });
  });

  describe('OAuth resolution', () => {
    it('authenticates as the user and carries the grant', async () => {
      const app = makeApp({
        oauthVerified: {
          userUid: 42,
          scopes: ['events:read', 'events:write'],
          clientId: 'app-1',
        },
        usersByUid: { 42: { uid: 42 } },
      });
      const { req, nextCalled } = await runOAuth(app, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(nextCalled).toBe(true);
      expect(req.user).toEqual({ uid: 42 });
      expect(req.oauth).toEqual({
        scopes: ['events:read', 'events:write'],
        clientId: 'app-1',
      });
    });

    it('401s an invalid or expired token (with WWW-Authenticate)', async () => {
      const { res, nextCalled } = await runOAuth(
        makeApp({ oauthVerified: null }),
        { headers: { authorization: `Bearer ${JWT}` } },
      );
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(401);
      expect(res.headers['WWW-Authenticate']).toMatch(/Bearer/);
    });

    it('401s when the token resolves no user', async () => {
      const app = makeApp({ oauthVerified: { userUid: 404, scopes: [] } });
      const { res, nextCalled } = await runOAuth(app, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(401);
    });

    it('forwards an infra fault (JWKS/DB) to next(err) instead of hanging', async () => {
      // verifyOAuthAccessToken bubbles a genuine JWKS-load fault; in an async
      // middleware Express 4 would NOT catch a raw rejection (socket hang +
      // unhandledRejection). The middleware must route it to next(err) so the
      // shared error handler renders a clean 500.
      const boom = new Error('JWKS unavailable');
      const app = makeApp({ verifyOAuthError: boom });
      const { res, nextCalled, nextArg } = await runOAuth(app, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(nextCalled).toBe(true);
      expect(nextArg).toBe(boom);
      expect(res.statusCode).toBeNull();
    });

    it('403s a blacklisted user behind a valid token', async () => {
      const app = makeApp({
        oauthVerified: { userUid: 7, scopes: [] },
        usersByUid: { 7: { uid: 7, isBlacklisted: true } },
      });
      const { res, nextCalled } = await runOAuth(app, {
        headers: { authorization: `Bearer ${JWT}` },
      });
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });
  });
});

describe('91 - api-v2 unit - requireScope', () => {
  it('passes through an unscoped credential (no req.oauth)', () => {
    const { nextCalled } = runMw(requireScope('events:write'), {});
    expect(nextCalled).toBe(true);
  });

  it('passes an OAuth caller holding the scope, and marks it checked', () => {
    const req = { oauth: { scopes: ['events:read', 'events:write'] } };
    const { nextCalled } = runMw(requireScope('events:write'), req);
    expect(nextCalled).toBe(true);
    expect(req.oauthScopeChecked).toBe(true);
  });

  it('403s an OAuth caller missing the scope (with challenge)', () => {
    const req = { oauth: { scopes: ['events:read'] } };
    const { res, nextCalled } = runMw(requireScope('events:write'), req);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.headers['WWW-Authenticate']).toMatch(/insufficient_scope/);
    expect(res.headers['WWW-Authenticate']).toMatch(/scope="events:write"/);
  });

  it('requires ALL listed scopes (transverse needs read + transverse)', () => {
    const ok = runMw(requireScope('events:read', 'events:transverse'), {
      oauth: { scopes: ['events:read', 'events:transverse'] },
    });
    expect(ok.nextCalled).toBe(true);

    const missing = runMw(requireScope('events:read', 'events:transverse'), {
      oauth: { scopes: ['events:read'] },
    });
    expect(missing.nextCalled).toBe(false);
    expect(missing.res.statusCode).toBe(403);
  });

  it('fail-closed on an empty grant', () => {
    const { res, nextCalled } = runMw(requireScope('events:read'), {
      oauth: { scopes: [] },
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});

describe('91 - api-v2 unit - denyOAuthScope', () => {
  it('passes a legacy (non-OAuth) caller, marking it checked', () => {
    const req = {};
    const { nextCalled } = runMw(denyOAuthScope, req);
    expect(nextCalled).toBe(true);
    expect(req.oauthScopeChecked).toBe(true);
  });

  it('403s any OAuth caller, whatever scopes it holds', () => {
    const { res, nextCalled } = runMw(denyOAuthScope, {
      oauth: { scopes: ['agendas:read', 'events:read'] },
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});

describe('91 - api-v2 unit - denyUncheckedOAuthScope (backstop)', () => {
  it('passes a legacy caller', () => {
    const { nextCalled } = runMw(denyUncheckedOAuthScope, {});
    expect(nextCalled).toBe(true);
  });

  it('passes an OAuth caller that was already scope-checked', () => {
    const { nextCalled } = runMw(denyUncheckedOAuthScope, {
      oauth: { scopes: ['events:read'] },
      oauthScopeChecked: true,
    });
    expect(nextCalled).toBe(true);
  });

  it('403s an OAuth caller that reached an ungated route', () => {
    const { res, nextCalled } = runMw(denyUncheckedOAuthScope, {
      oauth: { scopes: ['events:read'] },
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});
