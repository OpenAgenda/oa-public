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
  // One-time diagnostic latch (see the `iss`-mismatch branch below): a
  // misconfigured issuer fails EVERY token, so we log the hint once rather than
  // on every rejected request.
  let issuerHintShown = false;

  return {
    async verifyAccessToken(token) {
      let payload;
      try {
        // clockTolerance: small leeway for AS↔server clock drift (these tokens
        // can be short-lived once token-exchange is in play).
        ({ payload } = await jwtVerify(token, jwks, {
          issuer,
          audience,
          clockTolerance: 5,
        }));
      } catch (err) {
        // A wrong OA_OAUTH_ISSUER fails the `iss` claim on every token with no
        // obvious cause. The boot-time assertIssuer catches a reachable-AS
        // mismatch, but this is the runtime backstop (AS was unreachable at
        // boot, or env drifted since): log the configured-vs-received issuer
        // ONCE so the misconfig is diagnosable from the logs. We read the
        // received `iss` from the UNVERIFIED payload — safe, it only feeds a log.
        if (
          err instanceof joseErrors.JWTClaimValidationFailed
          && err.claim === 'iss'
          && !issuerHintShown
        ) {
          issuerHintShown = true;
          let tokenIss = '<unparseable>';
          try {
            tokenIss = JSON.parse(
              Buffer.from(token.split('.')[1], 'base64url').toString('utf8'),
            ).iss;
          } catch {
            // keep the placeholder — a non-JWS token has no readable payload
          }
          process.stderr.write(
            `[openagenda-mcp] issuer mismatch: token iss="${tokenIss}" but `
              + `OA_OAUTH_ISSUER expects "${issuer}". If every request is 401ing, `
              + "set OA_OAUTH_ISSUER to the AS's advertised issuer (typically the "
              + 'origin + "/api/auth").\n',
          );
        }
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
        // better-auth also mirrors it to `client_id` at introspection time. NO
        // `sub` fallback: `sub` is the better-auth user row id, NOT a client_id —
        // surfacing it here would conflate the two (`extra.sub` carries it
        // separately). A token with neither claim is genuinely client-anonymous.
        clientId: payload.azp ?? payload.client_id ?? 'unknown',
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
