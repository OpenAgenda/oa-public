import { jest } from '@jest/globals';
import Auth from '../src/index.js';

// The token-exchange endpoint (RFC 8693, O2.5). These tests cover the gating
// (exposed only when configured) and the request guards that run BEFORE subject
// verification — confidential-client auth, grant_type, and target-resource
// checks. The post-verification path (subject verification via JWKS, the
// per-client `subjectResource` binding check, and signing) needs a live keyset
// and is exercised end-to-end by public/mcp/scripts/smoke-oauth.js.

const fakeMysqlPool = { query: jest.fn() };
const V3_RESOURCE = 'https://dapi.openagenda.com/v3';
const MCP_RESOURCE = 'https://dmcp.openagenda.com/mcp';
const SECRET = 'exchange-secret-long-enough-for-the-test-aaaa';
const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:token-exchange';

const CLIENT_ID = 'mcp';
const basicAuth = (id, secret) =>
  `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;

const baseOpts = {
  mysqlPool: fakeMysqlPool,
  secret: 'test-secret-do-not-use-in-prod-just-long-enough',
  baseURL: 'http://localhost:3000',
};

const configured = () =>
  Auth({
    ...baseOpts,
    apiResourceUrl: V3_RESOURCE,
    exchangeClients: {
      [CLIENT_ID]: { secret: SECRET, subjectResource: MCP_RESOURCE },
    },
  });

// Invoke the endpoint, normalising better-auth's thrown APIError into a plain
// `{ status, body }` so the assertions read uniformly for success and failure.
async function call(auth, { authorization, body }) {
  const headers = new Headers();
  if (authorization) headers.set('authorization', authorization);
  try {
    const res = await auth.api.tokenExchange({
      headers,
      body,
      asResponse: true,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  } catch (err) {
    // APIError carries the HTTP status on `.statusCode` and the response shape
    // (our `{ error, error_description }`) on `.body`.
    return { status: err.statusCode ?? null, body: err.body ?? null };
  }
}

const validBody = (over = {}) => ({
  grant_type: GRANT_TYPE,
  subject_token: 'header.payload.signature',
  ...over,
});

describe('auth - token-exchange endpoint (O2.5)', () => {
  it('is NOT exposed when token-exchange is not configured', () => {
    const auth = Auth(baseOpts); // no apiResourceUrl / exchangeClients
    expect(auth.api.tokenExchange).toBeUndefined();
  });

  it('is exposed when apiResourceUrl and a registered client are set', () => {
    const auth = configured();
    expect(typeof auth.api.tokenExchange).toBe('function');
  });

  it('throws at construction when a registered client lacks subjectResource', () => {
    expect(() =>
      Auth({
        ...baseOpts,
        apiResourceUrl: V3_RESOURCE,
        // No subjectResource → the per-client authority boundary is undefined;
        // must fail fast rather than widen to the whole subject-audience union.
        exchangeClients: { [CLIENT_ID]: { secret: SECRET } },
      })).toThrow(/subjectResource/);
  });

  it('throws when exchange clients are set but apiResourceUrl is not', () => {
    expect(() =>
      Auth({
        ...baseOpts,
        // apiResourceUrl omitted (e.g. API_ROOT unset) but a client registered:
        // the endpoint could neither mint nor verify — surface it, don't drop it.
        exchangeClients: {
          [CLIENT_ID]: { secret: SECRET, subjectResource: MCP_RESOURCE },
        },
      })).toThrow(/apiResourceUrl/);
  });

  it('rejects a missing client credential (401 invalid_client)', async () => {
    const auth = configured();
    const { status, body } = await call(auth, { body: validBody() });
    expect(status).toBe(401);
    expect(body?.error).toBe('invalid_client');
  });

  it('rejects an unknown client_id (401 invalid_client)', async () => {
    const auth = configured();
    const { status, body } = await call(auth, {
      authorization: basicAuth('stranger', SECRET),
      body: validBody(),
    });
    expect(status).toBe(401);
    expect(body?.error).toBe('invalid_client');
  });

  it('rejects a wrong client secret (401 invalid_client)', async () => {
    const auth = configured();
    const { status, body } = await call(auth, {
      authorization: basicAuth(CLIENT_ID, 'not-the-secret'),
      body: validBody(),
    });
    expect(status).toBe(401);
    expect(body?.error).toBe('invalid_client');
  });

  it('rejects an unsupported grant_type (400 unsupported_grant_type)', async () => {
    const auth = configured();
    const { status, body } = await call(auth, {
      authorization: basicAuth(CLIENT_ID, SECRET),
      body: validBody({ grant_type: 'authorization_code' }),
    });
    expect(status).toBe(400);
    expect(body?.error).toBe('unsupported_grant_type');
  });

  it('rejects a target resource other than the v3 API (400 invalid_target)', async () => {
    const auth = configured();
    const { status, body } = await call(auth, {
      authorization: basicAuth(CLIENT_ID, SECRET),
      body: validBody({ resource: 'https://evil.example.com' }),
    });
    expect(status).toBe(400);
    expect(body?.error).toBe('invalid_target');
  });
});
