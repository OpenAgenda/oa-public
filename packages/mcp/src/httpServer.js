// HTTP transport: the MCP server as a standalone OAuth 2.1 resource server.
//
// Streamable HTTP (MCP spec) behind bearer auth. STATELESS by default — a fresh
// McpServer + transport per POST — so the process holds no per-session state and
// scales horizontally (the hosted target). Discovery: the OAuth 2.0 Protected
// Resource Metadata (RFC 9728) is served at the well-known path so a client can
// find the authorization server and obtain an audience-bound token.
//
// The server owns its whole subdomain and is served at the root (dmcp in dev,
// mcp.openagenda.com in prod), so the MCP endpoint is `POST /` and the PRM sits
// at /.well-known/oauth-protected-resource with no path collision.

import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { metadataHandler } from '@modelcontextprotocol/sdk/server/auth/handlers/metadata.js';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { createServer } from './server.js';
import { createTokenVerifier } from './auth/verifier.js';

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
  app.post('/', bearer, express.json(), async (req, res) => {
    const server = createServer({ config, executor });
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
  app.get('/', methodNotAllowed);
  app.delete('/', methodNotAllowed);

  return app;
}
