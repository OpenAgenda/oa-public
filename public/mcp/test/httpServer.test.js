import http from 'node:http';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { createHttpApp } from '../src/httpServer.js';
import { loadConfig } from '../src/config.js';

// Drives the HTTP transport as a REAL OAuth resource server: a local JWKS
// server signs EdDSA tokens, and we assert the bearer middleware + local JWKS
// verification (issuer/audience/scope/expiry) end-to-end. The executor is mocked
// (no sandbox binary, no network, no live API) — tool logic is covered by
// server.test.js; here we test auth + transport.

const ISSUER = 'https://auth.test';
// The resource id carries the /mcp endpoint path; the PRM is therefore served
// at the path-suffixed well-known (RFC 9728).
const RESOURCE = 'https://dmcp.test/mcp';
const PRM_PATH = '.well-known/oauth-protected-resource/mcp';

let jwksServer;
let jwksUrl;
let signingKey;
let app;
let appServer;
let baseUrl;

// Sign an access token the way the OAuth provider would: EdDSA, our issuer, our
// resource as audience, a space-delimited scope grant.
async function signToken({
  scope = 'openid events:read',
  audience = RESOURCE,
  issuer = ISSUER,
  expiresIn = '5m',
  kid = 'test-key-1',
} = {}) {
  return new SignJWT({ scope, azp: 'test-client' })
    .setProtectedHeader({ alg: 'EdDSA', kid })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject('user-123')
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(signingKey);
}

// POST a JSON-RPC request; returns { status, headers, body } where body is the
// parsed JSON-RPC payload (decoded from the SSE frame the transport emits).
async function rpc({
  method,
  params,
  token,
  id = 1,
  url = `${baseUrl}mcp`,
} = {}) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      ...params ? { params } : {},
      id,
    }),
  });
  const text = await res.text();
  let body;
  if (res.headers.get('content-type')?.includes('text/event-stream')) {
    const data = text.split('\n').find((l) => l.startsWith('data:'));
    body = data ? JSON.parse(data.slice(5).trim()) : undefined;
  } else if (text) {
    body = JSON.parse(text);
  }
  return { status: res.status, headers: res.headers, body };
}

// O2.5 token-exchange is mandatory for the http transport, but runs LAZILY — the
// server exchanges the bearer at the AS only when the `execute` tool actually
// runs, not on metadata calls (initialize/tools/list/search_docs). A default stub
// (installed per test) intercepts the exchange URL and returns a fixed minted
// token; everything else (JWKS fetch, rpc to our own server) hits the real fetch.
const EXCHANGE_SECRET = 'test-exchange-secret';
const EXCHANGE_URL = `${ISSUER}/oauth2/token-exchange`;
const MINTED_TOKEN = 'minted.aud-api.token';
let savedFetch;
let lastExchange;

function stubExchange(impl) {
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url === EXCHANGE_URL) {
      lastExchange = { init };
      return impl(init);
    }
    return savedFetch(input, init);
  };
}

const mintedResponse = () =>
  new Response(
    JSON.stringify({ access_token: MINTED_TOKEN, expires_in: 120 }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

function buildApp(env = {}) {
  const config = loadConfig({
    OA_MCP_TRANSPORT: 'http',
    OA_OAUTH_ISSUER: ISSUER,
    OA_MCP_RESOURCE_URL: RESOURCE,
    OA_OAUTH_JWKS_URL: jwksUrl,
    OA_MCP_EXCHANGE_SECRET: EXCHANGE_SECRET,
    OA_LOCAL_NO_SANDBOX: '1',
    ...env,
  });
  const executor = {
    name: 'mock',
    run: async () => ({
      stdout: '42',
      stderr: '',
      timedOut: false,
      exitCode: 0,
    }),
    dispose: async () => {},
  };
  return createHttpApp({ config, executor });
}

async function listen(expressApp) {
  const server = expressApp.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return server;
}

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA');
  signingKey = privateKey;
  const jwk = await exportJWK(publicKey);
  Object.assign(jwk, { kid: 'test-key-1', alg: 'EdDSA', use: 'sig' });
  jwksServer = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  await new Promise((resolve) => jwksServer.listen(0, resolve));
  jwksUrl = `http://127.0.0.1:${jwksServer.address().port}/jwks`;
});

afterAll(async () => {
  await new Promise((resolve) => jwksServer.close(resolve));
});

beforeEach(async () => {
  savedFetch = globalThis.fetch;
  lastExchange = null;
  stubExchange(() => mintedResponse());
  app = buildApp();
  appServer = await listen(app);
  baseUrl = `http://127.0.0.1:${appServer.address().port}/`;
});

afterEach(async () => {
  globalThis.fetch = savedFetch;
  await new Promise((resolve) => appServer.close(resolve));
});

describe('MCP HTTP resource server', () => {
  describe('protected resource metadata (RFC 9728)', () => {
    it('serves the PRM at the well-known path pointing at the AS', async () => {
      const res = await fetch(`${baseUrl}${PRM_PATH}`);
      expect(res.status).toBe(200);
      const prm = await res.json();
      expect(prm.resource).toBe(RESOURCE);
      expect(prm.authorization_servers).toEqual([ISSUER]);
      expect(prm.bearer_methods_supported).toEqual(['header']);
    });

    it('serves the same PRM at the root well-known (origin-derived clients)', async () => {
      // Some clients (Le Chat/Mistral's connector checklist) derive the PRM from
      // the origin and fetch the root form, without the resource path suffix.
      const res = await fetch(`${baseUrl}.well-known/oauth-protected-resource`);
      expect(res.status).toBe(200);
      const prm = await res.json();
      expect(prm.resource).toBe(RESOURCE);
      expect(prm.authorization_servers).toEqual([ISSUER]);
    });
  });

  describe('health endpoint', () => {
    it('serves an unauthenticated liveness probe at GET /health', async () => {
      // No token passed — the probe must answer 200 without auth, unlike /mcp.
      const res = await fetch(`${baseUrl}health`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    });
  });

  describe('landing page', () => {
    it('serves an HTML landing page at the root', async () => {
      const res = await fetch(baseUrl);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      const html = await res.text();
      expect(html).toContain('OpenAgenda MCP');
      // Advertises the /mcp endpoint a client should be configured with.
      expect(html).toContain(RESOURCE);
    });
  });

  describe('bearer auth', () => {
    it('rejects a request with no token (401 + WWW-Authenticate → PRM)', async () => {
      const { status, headers } = await rpc({ method: 'tools/list' });
      expect(status).toBe(401);
      const www = headers.get('www-authenticate');
      expect(www).toContain('error="invalid_token"');
      expect(www).toContain(
        'resource_metadata="https://dmcp.test/.well-known/oauth-protected-resource/mcp"',
      );
    });

    it('rejects a non-JWS token', async () => {
      const { status } = await rpc({ method: 'tools/list', token: 'garbage' });
      expect(status).toBe(401);
    });

    it('rejects a token signed for a different audience', async () => {
      const token = await signToken({ audience: 'https://evil.test' });
      const { status } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(401);
    });

    it('rejects a token from a different issuer', async () => {
      const token = await signToken({ issuer: 'https://evil-as.test' });
      const { status } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(401);
    });

    it('rejects an expired token', async () => {
      const token = await signToken({ expiresIn: '-1m' });
      const { status } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(401);
    });

    it('accepts a valid audience-bound token and lists the tools', async () => {
      const token = await signToken();
      const { status, body } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(200);
      expect(body.result.tools.map((t) => t.name).sort()).toEqual([
        'execute',
        'search_docs',
      ]);
    });
  });

  describe('delegation via token-exchange (O2.5)', () => {
    // Rebuild the default app with a capturing executor (the shared exchange stub
    // from beforeEach stays in effect unless a test overrides it).
    async function withCapturingApp(run) {
      await new Promise((resolve) => appServer.close(resolve));
      const config = loadConfig({
        OA_MCP_TRANSPORT: 'http',
        OA_OAUTH_ISSUER: ISSUER,
        OA_MCP_RESOURCE_URL: RESOURCE,
        OA_OAUTH_JWKS_URL: jwksUrl,
        OA_MCP_EXCHANGE_SECRET: EXCHANGE_SECRET,
        OA_LOCAL_NO_SANDBOX: '1',
      });
      app = createHttpApp({
        config,
        executor: { name: 'mock', run, dispose: async () => {} },
      });
      appServer = await listen(app);
      baseUrl = `http://127.0.0.1:${appServer.address().port}/`;
    }

    it('bakes the EXCHANGED aud=api token, never the caller bearer', async () => {
      // The whole point of the HTTP path: the server swaps the caller's aud=mcp
      // bearer for a short aud=api token (RFC 8693) BEFORE the sandbox, so the
      // caller's full grant never reaches executed code. The baked credential
      // must be the minted token, not the bearer.
      let received;
      await withCapturingApp(async (req) => {
        received = req;
        return { stdout: '1', stderr: '', timedOut: false, exitCode: 0 };
      });

      const token = await signToken();
      const { status } = await rpc({
        method: 'tools/call',
        params: { name: 'execute', arguments: { code: 'return 1;' } },
        token,
      });
      expect(status).toBe(200);
      // The minted token is baked; the caller's bearer is NOT.
      expect(received.code).toContain(MINTED_TOKEN);
      expect(received.code).not.toContain(token);
      // The exchange authenticated as the `mcp` confidential client and relayed
      // the bearer as the subject token.
      expect(lastExchange).not.toBeNull();
      const expectedBasic = `Basic ${Buffer.from(`mcp:${EXCHANGE_SECRET}`).toString('base64')}`;
      expect(lastExchange.init.headers.authorization).toBe(expectedBasic);
      expect(JSON.parse(lastExchange.init.body).subject_token).toBe(token);
    });

    it('rate-limits a caller across requests (per-sub, limiter shared by the app)', async () => {
      // Two execute calls from the SAME caller (same token → same `sub`) on a
      // burst-of-1 app: the first runs, the second is refused. Proves the limiter
      // persists across the stateless per-request servers and is keyed on `sub`.
      const limitedApp = buildApp({
        OA_RATE_LIMIT_BURST: '1',
        OA_RATE_LIMIT_PER_MIN: '1', // ~no refill within the test window
      });
      const server = await listen(limitedApp);
      const url = `http://127.0.0.1:${server.address().port}/mcp`;
      try {
        const token = await signToken();
        const call = (id) =>
          rpc({
            method: 'tools/call',
            params: { name: 'execute', arguments: { code: 'return 1;' } },
            token,
            id,
            url,
          });

        const first = await call(1);
        expect(first.status).toBe(200);
        expect(first.body.result.isError).toBeFalsy();

        const second = await call(2);
        expect(second.status).toBe(200); // transport OK — the TOOL refuses
        expect(second.body.result.isError).toBe(true);
        expect(second.body.result.content.map((c) => c.text).join('')).toMatch(
          /rate limit/i,
        );
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it('fails the execute tool (not the transport) when the exchange is rejected', async () => {
      // Lazy delegation: a rejected exchange fails THAT tool call (isError, with a
      // generic message — never the upstream detail) while the transport stays 200
      // and the sandbox never runs (no un-exchanged token is ever baked).
      stubExchange(
        () =>
          new Response(JSON.stringify({ error: 'invalid_client' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          }),
      );
      let ran = false;
      await withCapturingApp(async () => {
        ran = true;
        return { stdout: '1', stderr: '', timedOut: false, exitCode: 0 };
      });

      const token = await signToken();
      const { status, body } = await rpc({
        method: 'tools/call',
        params: { name: 'execute', arguments: { code: 'return 1;' } },
        token,
      });
      expect(status).toBe(200);
      expect(body.result.isError).toBe(true);
      expect(body.result.content[0].text).toMatch(
        /could not obtain an api credential/i,
      );
      // The sandbox must NOT run when the exchange failed (no un-exchanged token).
      expect(ran).toBe(false);
    });

    it('does NOT exchange for metadata calls (tools/list) — no AS dependency', async () => {
      // The decoupling lazy delegation buys: a broken AS must not break listing
      // tools. Even with an exchange stub that would 500, tools/list succeeds and
      // never hits the exchange endpoint.
      stubExchange(() => new Response('boom', { status: 500 }));
      const token = await signToken();
      const { status, body } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(200);
      expect(body.result.tools.map((t) => t.name).sort()).toEqual([
        'execute',
        'search_docs',
      ]);
      // The exchange endpoint was never called.
      expect(lastExchange).toBeNull();
    });
  });

  describe('required scopes', () => {
    it('returns 403 insufficient_scope when a required scope is missing', async () => {
      await new Promise((resolve) => appServer.close(resolve));
      app = buildApp({ OA_MCP_REQUIRED_SCOPES: 'events:write' });
      appServer = await listen(app);
      baseUrl = `http://127.0.0.1:${appServer.address().port}/`;

      const token = await signToken({ scope: 'openid events:read' });
      const { status, body } = await rpc({ method: 'tools/list', token });
      expect(status).toBe(403);
      expect(body.error).toBe('insufficient_scope');
    });
  });

  describe('unsupported methods (stateless)', () => {
    it('returns 405 for GET and DELETE on the /mcp endpoint', async () => {
      const get = await fetch(`${baseUrl}mcp`);
      expect(get.status).toBe(405);
      const del = await fetch(`${baseUrl}mcp`, { method: 'DELETE' });
      expect(del.status).toBe(405);
    });
  });
});
