// OAuth 2.1 bearer verification for the MCP HTTP resource server.
//
// The MCP server is a STANDALONE OAuth resource server: it validates access
// tokens LOCALLY against the authorization server's JWKS — no introspection
// round-trip, no shared secret, no runtime coupling to the auth monolith. This
// is the topology decided in docs/plan-oauth-provider.md O2, and the same local
// JWS path better-auth's own `verifyAccessToken` takes.
//
// A token is accepted only when it is a JWS signed by a key in the AS JWKS, is
// unexpired, and carries the expected issuer AND audience — our resource URL,
// which the client binds via the RFC 8707 `resource` parameter (that binding is
// what makes the provider issue a JWS rather than an opaque token). `jose`
// fetches and caches the JWKS and re-fetches on an unseen `kid`, so EdDSA key
// rotation on the AS is picked up without a restart.

import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from 'jose';
import { InvalidTokenError } from '@modelcontextprotocol/sdk/server/auth/errors.js';

/**
 * Build an `OAuthTokenVerifier` (the interface `requireBearerAuth` expects)
 * that verifies a bearer JWT against the authorization server's JWKS.
 *
 * @param {object} opts
 * @param {string} opts.jwksUrl  AS JWKS endpoint (e.g. …/api/auth/jwks)
 * @param {string} opts.issuer   expected `iss`
 * @param {string} opts.audience expected `aud` — this server's resource identifier
 * @returns {import('@modelcontextprotocol/sdk/server/auth/provider.js').OAuthTokenVerifier}
 */
export function createTokenVerifier({ jwksUrl, issuer, audience }) {
  const jwks = createRemoteJWKSet(new URL(jwksUrl));

  return {
    async verifyAccessToken(token) {
      let payload;
      try {
        ({ payload } = await jwtVerify(token, jwks, { issuer, audience }));
      } catch (err) {
        // Any failure — bad signature, wrong iss/aud, expired, or an opaque
        // (non-JWS) token — becomes a 401 invalid_token. `requireBearerAuth`
        // turns this into the WWW-Authenticate challenge pointing at the PRM.
        const reason = err instanceof joseErrors.JOSEError ? err.message : 'invalid token';
        throw new InvalidTokenError(reason);
      }

      const scopes = typeof payload.scope === 'string'
        ? payload.scope.split(' ').filter(Boolean)
        : [];

      return {
        token,
        // `azp` (authorized party) is the client_id on an OIDC access token;
        // better-auth also mirrors it to `client_id` at introspection time.
        clientId: payload.azp ?? payload.client_id ?? payload.sub ?? 'unknown',
        scopes,
        // jose already enforced expiry; surfacing it satisfies the middleware's
        // own numeric-expiry guard (it rejects a token with no `expiresAt`).
        expiresAt: payload.exp,
        resource: new URL(audience),
        // The consenting user — the eventual hook for per-user authorization
        // once the write surface lands (O2 stays read-only, see the plan).
        extra: { sub: payload.sub },
      };
    },
  };
}
