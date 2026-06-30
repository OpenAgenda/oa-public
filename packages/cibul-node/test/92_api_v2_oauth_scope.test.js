import ky from 'ky';
import Core from '../core/index.js';
import api from '../api/index.js';
import Services from '../services/init.js';
import { withTestServer } from './helpers/startTestServer.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

// Functional (server) coverage for the OAuth → v2 bridge: a JWS access token
// authenticates on /v2 and what it may DO is bounded by its scopes. This drives
// the FULL v2 chain end-to-end (verifyAndLoadOAuthUser → member guards →
// requireScope → core write) against a real `core`.
//
// The ONLY seam stubbed is `auth.verifyOAuthAccessToken` — the jose/JWKS
// signature+aud+iss+uid verification is exhaustively unit-tested in
// `packages/auth/test/13_oauthToken.test.js`, so here we map a known JWS-shaped
// string straight to the descriptor it would yield. Everything downstream (user
// load, blacklist, role checks, the per-route scope gate, the create handler) is
// the real thing. `app.services === core.services`, so replacing the method on
// the live auth instance is what the middleware actually calls.

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
];

// JWS-shaped tokens (three base64url segments) so verifyAndLoadOAuthUser routes
// them to the OAuth path; the stub below decides which descriptor each yields.
// user 1 is administrator of agenda 123 (fixtures/015.sql.js), so member guards
// pass and the scope gate is what's actually under test.
const TOK_READ = 'rd.rd.rd';
const TOK_WRITE = 'wr.wr.wr';
const TOK_AGENDA_ONLY = 'ag.ag.ag';
const TOK_UNKNOWN = 'zz.zz.zz'; // JWS-shaped but the verifier rejects it

const OAUTH_DESCRIPTORS = {
  [TOK_READ]: {
    userUid: 1,
    scopes: ['events:read', 'agendas:read'],
    clientId: 'oauth-test',
  },
  [TOK_WRITE]: {
    userUid: 1,
    scopes: ['events:read', 'events:write', 'agendas:read'],
    clientId: 'oauth-test',
  },
  [TOK_AGENDA_ONLY]: {
    userUid: 1,
    scopes: ['agendas:read'],
    clientId: 'oauth-test',
  },
};

// The fixture agenda key (fixtures/015.sql.js) — a non-OAuth credential, used to
// prove the scope gate is inert for keys (grantedScopesOf → null → pass).
const AGENDA_KEY = 'e830934e9d1848189ac74de3bfa7df0a';

describe('92 - api-v2 - functional(server): OAuth bearer + scope enforcement', () => {
  let core;

  const config = testConfig.extendWith({
    cachePrefix: 'c92_api_v2_oauth_test',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['015.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    // The single seam: map a known JWS string to its verified descriptor (or
    // null for an unknown/expired token). This is the same shape
    // `verifyOAuthAccessToken` returns for a real signed token.
    core.services.auth.verifyOAuthAccessToken = async (token) =>
      OAUTH_DESCRIPTORS[token] ?? null;

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({ index: 'test' })
      .catch(() => null);

    await core.agendas(123).events.search.rebuild();
  });

  const ctx = withTestServer(() => api(core, { useRouter: false }));

  afterAll(() => core.services.shutdown({ clear: true }));

  const get = (path, token) =>
    ky.get(`${ctx.baseUrl}${path}`, {
      throwHttpErrors: false,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });

  const post = (path, token, json) =>
    ky.post(`${ctx.baseUrl}${path}`, {
      throwHttpErrors: false,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      json,
    });

  describe('authentication', () => {
    it('authenticates a valid OAuth token and serves a read it is scoped for', async () => {
      const res = await get('/agendas/123/events', TOK_READ);
      expect(res.status).toBe(200);
    });

    it('401s an unknown/expired OAuth token with WWW-Authenticate: invalid_token', async () => {
      const res = await get('/agendas/123/events', TOK_UNKNOWN);
      expect(res.status).toBe(401);
      expect(res.headers.get('www-authenticate')).toMatch(/invalid_token/);
    });
  });

  describe('read scope', () => {
    it('403s a GET the token lacks the resource read scope for (insufficient_scope)', async () => {
      // agendas:read only — no events:read → the events list is out of scope.
      const res = await get('/agendas/123/events', TOK_AGENDA_ONLY);
      expect(res.status).toBe(403);
      const wwwAuth = res.headers.get('www-authenticate');
      expect(wwwAuth).toMatch(/insufficient_scope/);
      expect(wwwAuth).toMatch(/scope="events:read"/);
    });
  });

  describe('write scope', () => {
    const draft = { data: { title: { fr: 'OAuth scope test' } } };

    it('403s a write with a read-only token (member guard passes, scope blocks)', async () => {
      // user 1 is admin of 123, so member.allow() lets it through to the scope
      // gate — the 403 is the scope check, not the role check.
      const res = await post('/agendas/123/events', TOK_READ, draft);
      expect(res.status).toBe(403);
      const wwwAuth = res.headers.get('www-authenticate');
      expect(wwwAuth).toMatch(/insufficient_scope/);
      expect(wwwAuth).toMatch(/scope="events:write"/);
    });

    it('lets a write-scoped token through the gate (same request the read token was denied)', async () => {
      // The scope gate's job is binary: block or pass. With events:write it must
      // pass — the request reaches the create handler (whatever that handler then
      // makes of this minimal payload is orthogonal to scope). So: never the
      // insufficient_scope 403 the identical read-token request got above.
      const res = await post('/agendas/123/events', TOK_WRITE, draft);
      expect(res.status).not.toBe(403);
      expect(res.headers.get('www-authenticate') ?? '').not.toMatch(
        /insufficient_scope/,
      );
    });
  });

  describe('non-consentable surface (denyOAuthScope)', () => {
    it('403s any OAuth token on a route no scope covers', async () => {
      const res = await get('/networks/999999', TOK_READ);
      expect(res.status).toBe(403);
    });
  });

  describe('non-regression: legacy credentials are not scope-gated', () => {
    it('serves an agenda-key read (no req.oauth → gate is inert)', async () => {
      const res = await get(`/agendas/123/events?key=${AGENDA_KEY}`);
      expect(res.status).toBe(200);
    });
  });
});
