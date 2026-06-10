// HTTP transport: the MCP server as a standalone OAuth 2.1 resource server.
//
// Streamable HTTP (MCP spec) behind bearer auth. STATELESS by default — a fresh
// McpServer + transport per POST — so the process holds no per-session state and
// scales horizontally (the hosted target). Discovery: the OAuth 2.0 Protected
// Resource Metadata (RFC 9728) is served at the well-known path so a client can
// find the authorization server and obtain an audience-bound token.
//
// The server owns its whole subdomain (dmcp in dev, mcp.openagenda.com in prod).
// The MCP protocol endpoint is `POST /mcp` (Streamable HTTP); the resource URL
// therefore carries the `/mcp` path, so the PRM is served at the path-suffixed
// /.well-known/oauth-protected-resource/mcp (RFC 9728). The subdomain root is
// left for a human landing page (`GET /`) instead of the bare auth challenge.

import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { metadataHandler } from '@modelcontextprotocol/sdk/server/auth/handlers/metadata.js';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { createServer } from './server.js';
import { createRateLimiter } from './rateLimiter.js';
import { createCallerConcurrencyLimiter } from './callerConcurrency.js';
import { createTokenVerifier } from './auth/verifier.js';
import { exchangeToken, TokenExchangeError } from './auth/tokenExchange.js';
import { landingPage } from './landing.js';
import { log, makeAuditRecorder } from './log.js';
import { recordMetric } from './telemetry.js';

// JSON-RPC error returned without a request id (parse/transport-level failures).
const jsonRpcError = (code, message) => ({
  jsonrpc: '2.0',
  error: { code, message },
  id: null,
});

/**
 * Build the express app for the HTTP transport.
 *
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 * @param {import('./sandbox/executor.js').SandboxExecutor} deps.executor
 * @returns {import('express').Express}
 */
export function createHttpApp({ config, executor }) {
  const { oauth } = config;
  // loadConfig guarantees this for transport=http; assert as a defensive
  // invariant (and to narrow the type for the checker).
  if (!oauth) {
    throw new Error('createHttpApp requires OAuth config (transport=http)');
  }
  const app = express();
  app.disable('x-powered-by');

  // Liveness probe for uptime monitoring (and a future LB / horizontal scale — the
  // single-host SPOF is noted in the README). Unauthenticated by design (a probe
  // carries no OAuth token) and deliberately CHEAP: it only asserts "this process
  // is up and serving HTTP" — no token-exchange/AS round-trip, no sandbox spawn —
  // so a probe (or a flood of them) adds no load and never couples liveness to the
  // AS's availability. Nothing here gates it on auth (the bearer middleware is
  // attached only to the /mcp route below).
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Per-caller sustained-rate guard for `execute`, created ONCE and shared across
  // the per-request servers below so its bucket state persists between requests
  // (and across the whole process). Keyed on the OAuth `sub` (see the handler).
  const rateLimiter = createRateLimiter({
    capacity: config.rateLimit.burst,
    refillPerSec: config.rateLimit.perMin / 60,
  });

  // Per-caller concurrency cap, also created ONCE and shared across the
  // per-request servers so the in-flight count is process-wide. Keyed on the
  // same OAuth `sub`. Bounds how many runs ONE caller holds at once (fairness),
  // complementing rateLimiter's sustained-rate bound and the global slot cap.
  const callerConcurrency = createCallerConcurrencyLimiter({
    maxPerCaller: config.maxConcurrencyPerCaller,
  });

  // The protocol endpoint path IS the resource URL's path — single source of
  // truth so the endpoint, the token audience (`oauth.resourceUrl`), and the PRM
  // path can never diverge. Conventionally `/mcp` (Sentry/GitHub/Ref), but
  // whatever the configured resource carries. WHATWG keeps a path verbatim (no
  // trailing-slash ambiguity); a bare origin yields '/'.
  const mcpPath = new URL(oauth.resourceUrl).pathname;

  // Protected Resource Metadata (RFC 9728). The well-known path is derived from
  // the resource URL by the SDK helper. CORS + method restriction are handled by
  // metadataHandler so browser-based MCP clients can read it.
  const prmUrl = new URL(
    getOAuthProtectedResourceMetadataUrl(new URL(oauth.resourceUrl)),
  );
  const prm = metadataHandler({
    resource: oauth.resourceUrl,
    authorization_servers: [oauth.issuer],
    scopes_supported: oauth.scopesSupported,
    bearer_methods_supported: ['header'],
    resource_name: 'OpenAgenda MCP',
  });
  app.use(prmUrl.pathname, prm);
  // Some clients derive the PRM from the ORIGIN instead of the full resource
  // URL and fetch the root well-known, without the resource path suffix — Le
  // Chat (Mistral) documents exactly that URL in its connector troubleshooting
  // checklist. Serve the same document there so both derivations resolve.
  const rootPrmPath = '/.well-known/oauth-protected-resource';
  if (prmUrl.pathname !== rootPrmPath) {
    app.use(rootPrmPath, prm);
  }

  // Validate the JWS locally against the AS JWKS, bound to our resource as
  // audience. On failure the client gets a 401 with a WWW-Authenticate challenge
  // referencing the PRM above (how MCP clients discover where to authenticate).
  const bearer = requireBearerAuth({
    verifier: createTokenVerifier({
      jwksUrl: oauth.jwksUrl,
      issuer: oauth.issuer,
      audience: oauth.resourceUrl,
    }),
    requiredScopes: oauth.requiredScopes,
    resourceMetadataUrl: prmUrl.toString(),
  });

  // The MCP endpoint. `bearer` runs before the body is parsed so an
  // unauthenticated request is rejected without reading its payload. Stateless:
  // a new server+transport per request, torn down when the response closes.
  app.post(mcpPath, bearer, express.json(), async (req, res) => {
    // Delegation (O2.5): the executed code calls the v3 API as the consenting
    // user — never a shared key. We swap THIS caller's verified `aud=mcp` bearer
    // (req.auth is set by requireBearerAuth) for a short-lived `aud=api` token at
    // the AS, so the caller's full consented grant never reaches untrusted code.
    // This is the ONLY delegation path (no B2 fallback), and it runs LAZILY: the
    // exchange fires only when the `execute` tool actually runs (see
    // createServer/getCredential), so metadata-only POSTs (initialize, tools/list)
    // incur no AS round-trip and stay up even if the AS is briefly unavailable.
    // Identify the caller for the per-caller rate limit: the consenting user
    // (`sub`) is the stable, refresh-surviving key; fall back to the client app,
    // then a shared bucket for a pathological sub-less + client-anonymous token.
    // `extra.sub` is typed `unknown` (AuthInfo.extra is a free-form bag), so
    // narrow to a string. Use `||` (not `??`) so an EMPTY-string sub or clientId
    // falls through instead of becoming a falsy key (the server also defaults the
    // key, so an empty id can never bypass the limit — defense in depth).
    const sub = typeof req.auth?.extra?.sub === 'string' ? req.auth.extra.sub : '';
    // OA user id — the AS's optional `uid` custom claim (a number; absent for a
    // user with no linked OA uid). Surfaced for the audit trail only; `sub` stays
    // the key.
    const uid = typeof req.auth?.extra?.uid === 'number' ? req.auth.extra.uid : undefined;
    const callerId = sub || req.auth?.clientId || 'anonymous';
    const clientId = req.auth?.clientId;
    const server = createServer({
      config,
      executor,
      rateLimiter,
      callerConcurrency,
      callerId,
      // OA user id for the `user.uid` span attribute (audit carries it too). Absent
      // for a uid-less token; stdio passes nothing.
      callerUid: uid,
      // Audit identity: the consenting user (`sub` = AS join key, `uid` = OA
      // identity) + the client app. `callerId` already folds the rate-limit
      // fallback chain; pass the raw `sub`/`uid` as the audit caller so a
      // client-anonymous token reads as such, not 'anonymous'.
      recordAudit: makeAuditRecorder({
        transport: 'http',
        callerId: sub || undefined,
        callerUid: uid,
        clientId,
      }),
      // Metrics + spans share the per-call return paths with the audit recorder; the
      // singleton no-ops until initTelemetry ran with an OTLP endpoint (telemetry.js).
      recordMetric,
      getCredential: async () => {
        // The bearer middleware guarantees req.auth.token, but assert it
        // explicitly: it makes the invariant the exchange depends on visible
        // (and narrows the type from `string | undefined`).
        const subjectToken = req.auth?.token;
        if (!subjectToken) {
          throw new TokenExchangeError('no bearer token to exchange');
        }
        try {
          const { accessToken } = await exchangeToken({
            exchangeUrl: oauth.exchange.url,
            clientId: oauth.exchange.clientId,
            secret: oauth.exchange.secret,
            subjectToken,
            // No `resource` (RFC 8707): deliberate. The AS owns the v3 resource id
            // (`apiResourceUrl`, derived from API_ROOT) and binds the minted token
            // to it by default, so it stays the single source of truth — the MCP
            // carries no copy that could drift. (We couldn't anyway: `config.baseUrl`
            // is the INTERNAL URL the generated v3 SDK calls, e.g.
            // http://node:8902/v3, not the public aud=api the AS mints and the v3
            // verifier trusts — they differ on the docker network.) Caveat: if the
            // AS ever serves >1 mint resource, the MCP would need the specific id here.
          });
          return accessToken;
        } catch (err) {
          // Observability only — the `execute` tool surfaces a generic failure to
          // the client (no upstream detail). Never bake the un-exchanged token.
          log.warn(
            'token exchange failed: %s',
            err instanceof Error ? err.message : String(err),
          );
          throw err;
        }
      },
    });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) {
        res.status(500).json(jsonRpcError(-32603, 'Internal server error'));
      }
    }
  });

  // Stateless mode keeps no server→client stream and no session to resume or
  // delete, so GET (SSE) and DELETE (session teardown) are not supported.
  const methodNotAllowed = (req, res) =>
    res
      .status(405)
      .json(jsonRpcError(-32000, 'Method not allowed (stateless server).'));
  app.get(mcpPath, methodNotAllowed);
  app.delete(mcpPath, methodNotAllowed);

  // Human landing page at the root — the MCP endpoint sits at `mcpPath`, so a
  // browser visitor to `/` gets a real page instead of the auth challenge. Only
  // when the endpoint isn't itself at the root (a bare-origin resource would put
  // POST / at `/`; we then leave `/` to the endpoint, no separate landing).
  if (mcpPath !== '/') {
    app.get('/', (req, res) => {
      res.type('html').send(landingPage(oauth));
    });
  }

  return app;
}
