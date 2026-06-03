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
import { createTokenVerifier } from './auth/verifier.js';
import { landingPage } from './landing.js';

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
  app.use(
    prmUrl.pathname,
    metadataHandler({
      resource: oauth.resourceUrl,
      authorization_servers: [oauth.issuer],
      scopes_supported: oauth.scopesSupported,
      bearer_methods_supported: ['header'],
      resource_name: 'OpenAgenda MCP',
    }),
  );

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
    // Delegation: bake THIS caller's verified access token into the sandboxed
    // code (req.auth is set by requireBearerAuth). The executed code therefore
    // calls the v3 API as the consenting user — never with a shared key.
    const server = createServer({
      config,
      executor,
      credential: req.auth?.token ?? null,
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
