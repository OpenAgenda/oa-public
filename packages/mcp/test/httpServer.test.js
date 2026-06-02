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
const RESOURCE = 'https://dmcp.test';

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
async function rpc({ method, token, id = 1 } = {}) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method, id }),
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

function buildApp(env = {}) {
  const config = loadConfig({
    OA_MCP_TRANSPORT: 'http',
    OA_OAUTH_ISSUER: ISSUER,
    OA_MCP_RESOURCE_URL: RESOURCE,
    OA_OAUTH_JWKS_URL: jwksUrl,
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
  app = buildApp();
  appServer = await listen(app);
  baseUrl = `http://127.0.0.1:${appServer.address().port}/`;
});

afterEach(async () => {
  await new Promise((resolve) => appServer.close(resolve));
});

describe('MCP HTTP resource server', () => {
  describe('protected resource metadata (RFC 9728)', () => {
    it('serves the PRM at the well-known path pointing at the AS', async () => {
      const res = await fetch(`${baseUrl}.well-known/oauth-protected-resource`);
      expect(res.status).toBe(200);
      const prm = await res.json();
      expect(prm.resource).toBe(RESOURCE);
      expect(prm.authorization_servers).toEqual([ISSUER]);
      expect(prm.bearer_methods_supported).toEqual(['header']);
    });
  });

  describe('bearer auth', () => {
    it('rejects a request with no token (401 + WWW-Authenticate → PRM)', async () => {
      const { status, headers } = await rpc({ method: 'tools/list' });
      expect(status).toBe(401);
      const www = headers.get('www-authenticate');
      expect(www).toContain('error="invalid_token"');
      expect(www).toContain(
        'resource_metadata="https://dmcp.test/.well-known/oauth-protected-resource"',
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
    it('returns 405 for GET and DELETE on the endpoint', async () => {
      const get = await fetch(baseUrl);
      expect(get.status).toBe(405);
      const del = await fetch(baseUrl, { method: 'DELETE' });
      expect(del.status).toBe(405);
    });
  });
});
