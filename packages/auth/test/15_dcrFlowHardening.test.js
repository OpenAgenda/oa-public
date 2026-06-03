import { SafeUrlSchema } from '@better-auth/core/utils/redirect-uri';
import Auth from '../src/index.js';

// DCR flow-credential posture (O3 — public Dynamic Client Registration).
//
// The registry is open (anyone may self-register), so the strength of the flow
// rests on PKCE and redirect-URI validation. Both are enforced by
// `@better-auth/oauth-provider` DEFAULTS, not by our config — this suite pins
// that posture so a plugin bump or a future config change can't loosen it in
// silence. What the plugin guarantees (verified in dist at authoring time):
//
//   - PKCE is required for every client: `isPKCERequired` returns true unless a
//     client explicitly set `requirePKCE === false`, and the default is
//     `requirePKCE ?? true`. Public / native / user-agent clients and any
//     `offline_access` request force it regardless.
//   - A DCR client CANNOT opt out: the `/oauth2/register` body schema has no
//     `require_pkce` field at all, and `skip_consent` is `z.never`.
//   - Only S256 is accepted; `plain` is rejected at the `/oauth2/authorize`
//     query schema (`code_challenge_method: z.enum(["S256"])`).
//   - Redirect URIs go through `SafeUrlSchema`: https-only except loopback
//     (RFC 6761 `*.localhost`, `127.0.0.0/8`, `[::1]`); dangerous schemes
//     (`javascript:`/`data:`/`vbscript:`) rejected. Custom schemes
//     (`myapp://…`) are ALLOWED by design (RFC 8252 native apps) — a deliberate
//     decision: mandatory PKCE is the IETF-sanctioned mitigation for native
//     redirect interception (BCP 212), so we don't reject mobile clients.
//
// These assertions run at the zod input boundary, so no live DB is needed.

const baseOpts = {
  mysqlPool: { query: () => {} },
  secret: 'test-secret-do-not-use-in-prod-just-long-enough',
  baseURL: 'http://localhost:3000',
};

// The very dangerous-scheme URL whose rejection we assert. Assembled at runtime
// rather than written as a literal so eslint's `no-script-url` rule doesn't trip
// on the test that exists precisely to prove this scheme is rejected.
const JAVASCRIPT_URL = ['javascript', 'alert(1)'].join(':');

// Invoke an endpoint and normalise the outcome to `{ status, code, message }`.
// With `asResponse: true`, better-auth returns a Response (a 400 with a
// `{ code, message }` body for a validation failure) rather than throwing; a
// request that clears validation and then hits the fake pool surfaces as a
// thrown error → `status: null`. That gap is exactly how we tell "rejected by
// validation" (400) from "accepted, failed downstream" (not 400).
async function call(fn, arg) {
  try {
    const res = await fn({ ...arg, asResponse: true });
    const body = await res.json().catch(() => null);
    return {
      status: res.status,
      code: body?.code ?? null,
      message: body?.message ?? null,
    };
  } catch (err) {
    return {
      status: err.statusCode ?? null,
      code: err.body?.code ?? null,
      message: err.body?.message ?? err.message ?? null,
    };
  }
}

describe('auth - DCR redirect-URI policy (SafeUrlSchema contract)', () => {
  // Allowed: https anywhere; http only on loopback (RFC 6761/8252 native apps);
  // custom schemes (RFC 8252 mobile) — deliberate, mandatory PKCE is the
  // mitigation (BCP 212), so we don't reject mobile clients.
  it.each([
    'https://app.example.com/callback',
    'http://127.0.0.1:8080/cb',
    'http://[::1]/cb',
    'http://app.localhost/cb',
    'myapp://callback',
  ])('accepts %s', (uri) => {
    expect(SafeUrlSchema.safeParse(uri).success).toBe(true);
  });

  // Rejected: http on a non-loopback host (downgrade) and dangerous schemes.
  it.each(['http://evil.example.com/cb', JAVASCRIPT_URL, 'data:text/html,x'])(
    'rejects %s',
    (uri) => {
      expect(SafeUrlSchema.safeParse(uri).success).toBe(false);
    },
  );
});

describe('auth - /oauth2/register enforces the DCR posture', () => {
  const register = (body) =>
    call(Auth(baseOpts).instance.api.registerOAuthClient, { body });

  it('rejects an http non-loopback redirect_uri at validation', async () => {
    const res = await register({
      redirect_uris: ['http://evil.example.com/cb'],
    });
    expect(res.status).toBe(400);
    expect(res.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a javascript: redirect_uri at validation', async () => {
    const res = await register({ redirect_uris: [JAVASCRIPT_URL] });
    expect(res.status).toBe(400);
  });

  it('rejects skip_consent (a DCR client can never bypass consent)', async () => {
    const res = await register({
      redirect_uris: ['https://app.example.com/cb'],
      skip_consent: true,
    });
    expect(res.status).toBe(400);
    expect(res.message).toMatch(/skip_consent/);
  });

  it('does NOT reject a loopback redirect at validation (gets past it)', async () => {
    // No live DB, so a request that clears validation fails downstream instead.
    // The point: it is NOT a 400 validation rejection — loopback stays allowed.
    const res = await register({ redirect_uris: ['http://127.0.0.1:8080/cb'] });
    expect(res.status).not.toBe(400);
  });

  it('does NOT reject a custom-scheme redirect at validation (gets past it)', async () => {
    const res = await register({ redirect_uris: ['myapp://callback'] });
    expect(res.status).not.toBe(400);
  });
});

describe('auth - /oauth2/authorize enforces PKCE method + redirect posture', () => {
  const authorize = (query) =>
    call(Auth(baseOpts).instance.api.oauth2Authorize, { query });

  it('rejects a non-S256 code_challenge_method (no PKCE downgrade to plain)', async () => {
    const res = await authorize({
      client_id: 'some-client',
      code_challenge: 'abc',
      code_challenge_method: 'plain',
    });
    expect(res.status).toBe(400);
    expect(res.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an http non-loopback redirect_uri at validation', async () => {
    const res = await authorize({
      client_id: 'some-client',
      redirect_uri: 'http://evil.example.com/cb',
    });
    expect(res.status).toBe(400);
  });
});
