// OA-issued OAuth access-token verification, for resource servers that live in
// the SAME process as the authorization server (the v3 API). The MCP HTTP
// resource server verifies the same tokens out-of-process via JWKS over HTTP
// (packages/mcp/src/auth/verifier.js); this is its in-process twin.
//
// WHY a local twin instead of a loopback /jwks fetch: the API is the AS, so it
// can pull the public keyset directly from the `jwt` plugin
// (`instance.api.getJwks()`) with no HTTP round-trip and no private-CA trust
// dance in dev. jose verifies the JWS offline against that keyset.
//
// AUDIENCE — the B2 delegation model (see docs/plan-oauth-provider.md §O2). The
// reference MCP client always binds its token to the MCP server's own origin
// (`aud=<mcp resource>`), never to the v3 API, so a strict `aud=API` check would
// reject every delegated call. We accept a token whose `aud` is one of the
// `validAudiences` passed here — the resources that DELEGATE to v3 (the MCP).
// This list is deliberately NARROWER than the full set the AS issues tokens for:
// the bare AS origin (OIDC/userinfo, "Sign in with OpenAgenda" SSO) is EXCLUDED,
// so a login token bound to it cannot double as a v3 API credential. The hard
// authority boundary stays signature + issuer + expiry; the `aud` check scopes
// "a token bound to a resource that delegates to v3".

import { createLocalJWKSet, jwtVerify } from 'jose';

// Small leeway (seconds) on exp/nbf/iat. Token-exchange mints short-lived tokens
// (~120s); without tolerance, modest clock drift between the AS and this verifier
// could make a just-minted token read as expired at the window edges.
const CLOCK_TOLERANCE_S = 5;

/**
 * @param {object} instance  the better-auth instance (exposes `api.getJwks`
 *   and `$context`).
 * @param {object} opts
 * @param {string[]} opts.validAudiences  audiences this AS issues tokens for.
 * @param {number} [opts.jwksCooldownMs]  min interval between kid-miss JWKS
 *   refetches (default 30s) — throttles a bogus-`kid` flood.
 * @returns {{ verifyOAuthAccessToken: (token: string) => Promise<null | {
 *   userUid: number, scopes: string[], clientId: string|null, audiences: string[]
 * }> }}
 */
export default function createOAuthTokenHelpers(
  instance,
  { validAudiences, jwksCooldownMs = 30_000 },
) {
  // The local keyset, lazily built from the plugin's JWKS and cached. EdDSA
  // signing keys rotate rarely; on a `kid` miss we refetch (below, throttled) so
  // a rotation is picked up without a process restart.
  let jwks = null;
  // When the keyset was last (re)built — gates the kid-miss refetch.
  let lastRefreshAt = 0;
  // In-flight refresh, shared so concurrent verifies coalesce into one getJwks().
  let refreshInFlight = null;
  // The expected `iss`. NOT the `baseURL` option passed to Auth() — better-auth
  // appends its basePath (`/api/auth`) to form the effective issuer it stamps on
  // tokens (`ctx.context.baseURL`). Resolve it from the instance context so this
  // is the SAME string BA signs with, regardless of how baseURL/basePath are set.
  let issuer = null;

  function refreshJwks() {
    // Coalesce: a burst of concurrent verifies triggers exactly one fetch.
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const set = await instance.api.getJwks();
        jwks = createLocalJWKSet(set);
        lastRefreshAt = Date.now();
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  async function getIssuer() {
    if (!issuer) {
      const ctx = await instance.$context;
      issuer = ctx.baseURL;
    }
    return issuer;
  }

  async function verify(token) {
    if (!jwks) await refreshJwks();
    const iss = await getIssuer();
    try {
      return await jwtVerify(token, jwks, {
        issuer: iss,
        clockTolerance: CLOCK_TOLERANCE_S,
      });
    } catch (err) {
      // A signing-key rotation makes the cached keyset miss the token's `kid`.
      // Refetch and retry — but THROTTLED: the `kid` is read from the unverified
      // header before signature checks, so a stream of bogus-`kid` tokens could
      // otherwise force a JWKS reload (a DB-backed getJwks) per request on this
      // public auth path. Like jose's createRemoteJWKSet, refetch at most once per
      // `jwksCooldownMs`; within the window a miss is terminal. Any other failure
      // (bad sig, expired, wrong iss) is terminal too.
      if (
        err?.code === 'ERR_JWKS_NO_MATCHING_KEY'
        && Date.now() - lastRefreshAt >= jwksCooldownMs
      ) {
        await refreshJwks();
        return jwtVerify(token, jwks, {
          issuer: iss,
          clockTolerance: CLOCK_TOLERANCE_S,
        });
      }
      throw err;
    }
  }

  /**
   * Verify an OA-issued JWS access token. Returns a normalized descriptor on
   * success, or `null` for any invalid/foreign token (malformed, bad signature,
   * wrong issuer, expired, audience we never issued, non-numeric subject). Never
   * throws on an invalid token — only a genuine infra fault (JWKS load) bubbles.
   */
  async function verifyOAuthAccessToken(token) {
    // Cheap structural gate: a JWS is exactly three dot-separated segments. Skips
    // the keyset work for anything that obviously isn't a JWT (e.g. an oa_pk_ key).
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      return null;
    }

    let payload;
    try {
      ({ payload } = await verify(token));
    } catch {
      return null;
    }

    let auds = [];
    if (Array.isArray(payload.aud)) auds = payload.aud;
    else if (payload.aud != null) auds = [payload.aud];
    if (!auds.some((a) => validAudiences.includes(a))) {
      return null;
    }

    // The OA uid travels in the `uid` claim (a JSON number — see
    // `customAccessTokenClaims` in index.js; the JWT `sub` is the better-auth
    // row id, NOT the OpenAgenda uid downstream resolvers key on). A token with
    // no `uid` is not a user-delegated OA token (e.g. a client_credentials
    // machine token) and has no OA identity to act as → reject for this path.
    // Gate it as a POSITIVE SAFE INTEGER so a malformed claim (a string, float,
    // 0/negative, NaN, or a value past 2^53) never becomes a real-looking
    // identity at this token→user boundary. OA uids are bounded < 2^48, so a
    // legitimate value always clears the safe-integer ceiling.
    const { uid } = payload;
    if (typeof uid !== 'number' || !Number.isSafeInteger(uid) || uid <= 0) {
      return null;
    }

    const scopes = typeof payload.scope === 'string'
      ? payload.scope.split(' ').filter(Boolean)
      : [];

    return {
      // The uid type used everywhere downstream (the codebase compares
      // `user.uid === …` with strict numeric equality; the DB driver returns the
      // BIGINT column as a JS number). The claim is already a number — the gate
      // above guarantees it's a positive safe integer.
      userUid: uid,
      scopes,
      clientId: payload.azp ?? payload.client_id ?? null,
      audiences: auds,
    };
  }

  return { verifyOAuthAccessToken };
}
