// Smoke test for the HTTP transport as an OAuth resource server (the O2
// delegation path). Drives a real OAuth 2.1 + PKCE authorization-code flow
// against a LIVE authorization server, obtains an access token bound to the MCP
// resource (RFC 8707), and exercises the full delegation chain end-to-end:
//
//   1. POST /sign-in/email           → session cookie
//   2. GET  /oauth2/authorize        → consent redirect (signed oauth_query)
//   3. POST /oauth2/consent          → { redirect, url?code }
//   4. POST /oauth2/token (PKCE)     → JWS access token (aud=<mcp>, uid claim)
//   5. assert claims                 → aud/iss/uid/TTL
//   6. v3 API directly with the token → NOT 401 (verifier + user resolution)
//   7. MCP tools/list + execute       → via the MCP resource server
//   8. execute relays the token to v3 → NOT 401 (token survives into the sandbox)
//
// Unlike the public MCP clients, this does NOT use Dynamic Client Registration
// (the AS keeps it OFF until O3) — it uses a PRE-REGISTERED public PKCE client.
//
// Prerequisites (dev): the stack is up (node + the mcp container + nginx), the
// `smoke-mcp-client` row exists in `oauth_client`, and a verified user exists.
// The dev domains serve a private CA, so trust it:
//
//   NODE_EXTRA_CA_CERTS=docker/devinstaller/ssl/certs/ca.crt \
//     node packages/mcp/scripts/smoke-oauth.js
//
// All endpoints/credentials are overridable via env (see DEFAULTS below).

import { createHash, randomBytes } from 'node:crypto';

const cfg = {
  asUrl: process.env.OA_AS_URL ?? 'https://d.openagenda.com/api/auth',
  mcpUrl: process.env.OA_MCP_URL ?? 'https://dmcp.openagenda.com/mcp',
  clientId: process.env.OA_OAUTH_CLIENT_ID ?? 'smoke-mcp-client',
  redirectUri:
    process.env.OA_OAUTH_REDIRECT_URI
    ?? 'https://d.openagenda.com/oauth-smoke-cb',
  email: process.env.OA_SMOKE_EMAIL ?? 'mcp-smoke@example.com',
  password: process.env.OA_SMOKE_PASSWORD ?? 'Smoke!Pass123',
  scope: process.env.OA_SMOKE_SCOPE ?? 'openid events:read',
  agendaUid: process.env.OA_AGENDA_UID ?? '1',
};
// The CSRF Origin the AS enforces on POST is the site root (the AS without its
// /api/auth basePath).
const { origin } = new URL(cfg.asUrl);
// The RFC 8707 `resource` exactly as a real MCP client computes it
// (`new URL(serverUrl).href`). The endpoint carries the `/mcp` path, so this is
// `https://dmcp.openagenda.com/mcp` — the value the AS (validAudiences) and the
// MCP container (jose `audience`) both match byte-for-byte.
const resourceIndicator = new URL(cfg.mcpUrl).href;

let pass = 0;
let fail = 0;
const ok = (cond, msg, extra = '') => {
  if (cond) {
    pass += 1;
    console.log('✓', msg);
  } else {
    fail += 1;
    console.log('✗', msg, extra);
  }
};

const b64url = (buf) =>
  buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
const verifier = b64url(randomBytes(48));
const challenge = b64url(createHash('sha256').update(verifier).digest());

// Minimal cookie jar (the session cookie from sign-in must ride the authorize +
// consent requests).
const jar = new Map();
const storeCookies = (res) => {
  for (const sc of res.headers.getSetCookie?.() ?? []) {
    const [pair] = sc.split(';');
    const i = pair.indexOf('=');
    jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
};
const cookieHeader = () =>
  [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

const decodeJwtPayload = (jwt) =>
  JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());

// 1. sign in (email + password) → session cookie
let res = await fetch(`${cfg.asUrl}/sign-in/email`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', Origin: origin },
  body: JSON.stringify({ email: cfg.email, password: cfg.password }),
});
storeCookies(res);
ok(res.status === 200, `sign-in (${res.status})`, await res.clone().text());
ok(jar.size > 0, 'session cookie set');

// 2. authorize (PKCE). The plugin answers 200 `{ redirect, url }`, not a 3xx.
const authQuery = new URLSearchParams({
  client_id: cfg.clientId,
  response_type: 'code',
  redirect_uri: cfg.redirectUri,
  scope: cfg.scope,
  state: b64url(randomBytes(8)),
  code_challenge: challenge,
  code_challenge_method: 'S256',
});
res = await fetch(`${cfg.asUrl}/oauth2/authorize?${authQuery}`, {
  headers: { cookie: cookieHeader(), accept: 'application/json' },
  redirect: 'manual',
});
storeCookies(res);
let location = res.headers.get('location') ?? '';
if (!location) {
  const body = await res
    .clone()
    .json()
    .catch(() => ({}));
  location = body.url ?? '';
}
ok(
  res.status < 400 && !!location,
  `authorize → redirect (${res.status})`,
  location,
);

// 3. consent (when required) → authorization code
let code;
if (location.includes('/auth/consent')) {
  const oauthQuery = location.slice(location.indexOf('?') + 1);
  res = await fetch(`${cfg.asUrl}/oauth2/consent`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Origin: origin,
      cookie: cookieHeader(),
    },
    body: JSON.stringify({
      accept: true,
      client_id: cfg.clientId,
      oauth_query: oauthQuery,
    }),
  });
  const body = await res.json();
  ok(
    res.status === 200 && body.redirect,
    `consent → redirect (${res.status})`,
    JSON.stringify(body),
  );
  code = new URL(body.url).searchParams.get('code');
} else if (location.includes('code=')) {
  ok(true, 'consent skipped (already granted)');
  code = new URL(location).searchParams.get('code');
}
ok(!!code, 'authorization code obtained', location);

// 4. token exchange. The RFC 8707 `resource` is read at the TOKEN endpoint
// (not authorize) — it is what binds aud=<mcp> and yields a JWS access token.
res = await fetch(`${cfg.asUrl}/oauth2/token`, {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    Origin: origin,
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: cfg.redirectUri,
    client_id: cfg.clientId,
    code_verifier: verifier,
    resource: resourceIndicator,
  }),
});
const tokenResponse = await res.json();
const accessToken = tokenResponse.access_token;
ok(
  res.status === 200 && !!accessToken,
  `token exchange (${res.status})`,
  JSON.stringify(tokenResponse),
);
ok(
  typeof accessToken === 'string' && accessToken.split('.').length === 3,
  'access token is a JWS (resource binding yielded a signed token)',
);
if (accessToken?.split('.').length !== 3) {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(1);
}

// 5. assert the claims the resource servers rely on.
const claims = decodeJwtPayload(accessToken);
const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
ok(
  audiences.includes(resourceIndicator),
  `aud includes the MCP resource (${JSON.stringify(claims.aud)})`,
);
ok(claims.iss === cfg.asUrl, `iss === ${cfg.asUrl} (${claims.iss})`);
ok(
  typeof claims.uid === 'string' && /^\d+$/.test(claims.uid),
  `uid claim present — the OA identity, not sub (${claims.uid} vs sub=${claims.sub})`,
);
ok(
  claims.exp - claims.iat <= 3600,
  `short access-token TTL (${claims.exp - claims.iat}s)`,
);

// 6. v3 API directly with the token. A 401 means the token was REJECTED; any
// other status means authenticate() passed (auth runs before the lookup).
// Derive from the MCP endpoint's ORIGIN (the path is /mcp): dmcp → dapi.
const v3 = new URL(cfg.mcpUrl).origin.replace('//dmcp.', '//dapi.');
const v3Base = process.env.OA_V3_URL ?? `${v3}/v3`;
res = await fetch(`${v3Base}/agendas/${cfg.agendaUid}/events?size=1`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
ok(
  res.status !== 401,
  `v3 API accepts the OAuth token — not 401 (${res.status})`,
  (await res.text()).slice(0, 160),
);

// 7 + 8. MCP over Streamable HTTP at the resource server (the /mcp endpoint).
const rpc = async (method, params) => {
  const r = await fetch(cfg.mcpUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      ...params ? { params } : {},
      id: 1,
    }),
  });
  const text = await r.text();
  const dataLine = text.split('\n').find((l) => l.startsWith('data:'));
  return {
    status: r.status,
    body: dataLine ? JSON.parse(dataLine.slice(5).trim()) : text,
  };
};
const textOf = (m) =>
  m.body?.result?.content?.map((c) => c.text).join('')
  ?? JSON.stringify(m.body);

let m = await rpc('tools/list');
ok(
  m.status === 200 && Array.isArray(m.body?.result?.tools),
  `MCP tools/list via the resource server (${m.status})`,
  JSON.stringify(m.body).slice(0, 160),
);

m = await rpc('tools/call', {
  name: 'execute',
  arguments: { code: 'return 1 + 1;' },
});
ok(
  m.status === 200 && textOf(m).includes('2'),
  `MCP execute → 2 (${m.status})`,
  textOf(m).slice(0, 200),
);

// The relayed token must survive into the sandbox and reach v3. We return the
// HTTP status the SDK observed; 401 would mean the token did not survive.
const readCode = `const r = await oa.agendas.events.list({ path: { agendaUid: ${Number(cfg.agendaUid)} }, query: { size: 1 } }); return { status: r.response?.status ?? null };`;
m = await rpc('tools/call', { name: 'execute', arguments: { code: readCode } });
ok(
  m.status === 200 && !textOf(m).includes('401'),
  `execute relays the caller token to v3 — no 401 (${m.status})`,
  textOf(m).slice(0, 200),
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
