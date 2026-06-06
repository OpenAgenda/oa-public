// RFC 8693 OAuth 2.0 Token Exchange — the O2.5 delegation hardening.
//
// A first-party GATEWAY service (today: the MCP HTTP server) holds a caller's
// access token bound to its own resource (`aud=<subjectResource>`, the full
// consented grant) and swaps it HERE — before any sandbox — for a SHORT-lived,
// optionally down-scoped token bound to the in-process API
// (`aud=<apiResourceUrl>`). The consented gateway/SSO token therefore never
// reaches untrusted code, so the AS can keep a normal access-token TTL for
// everyone else (see index.js `accessTokenExpiresIn`).
//
// WHY this lives in the auth service: the JWS signing key is the `jwt` plugin's
// JWKS private key, held here. The calling service must not hold it.
//
// CALLER AUTH — each gateway is a CONFIDENTIAL CLIENT with its own credentials
// (`client_secret_basic`, RFC 6749 §2.3.1), looked up in the `clients` registry.
// Per-service secrets give independent rotation/revocation and per-service policy
// (`subjectResource`, `allowedScopes`, `allowedResources`, `tokenTtl`); adding a
// service = a new registry entry, no contract change. A client may only exchange
// a token bound to ITS OWN `subjectResource` — gateway A cannot swap gateway B's
// tokens. These are FIRST-PARTY internal services, deliberately kept separate
// from the public `oauth_client`/DCR table.
//
// `@better-auth/oauth-provider` has a hardcoded grant switch with no
// token-exchange grant, so this is our own endpoint. The minted token is signed
// with the SAME key (`signJWT` + the jwt plugin options) the API verifier trusts
// via JWKS, and carries the same private `uid` claim resolvers key on.

import * as z from 'zod';
import { createAuthEndpoint, APIError } from 'better-auth/api';
import { signJWT } from 'better-auth/plugins';
import { constantTimeEqual } from 'better-auth/crypto';

const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const ACCESS_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:access_token';

// Floor on a minted token's lifetime. A `0`/negative TTL would mint an
// already-expired token (exp ≤ iat) — a silent config error rather than a usable
// short token; below ~30s, normal clock skew between AS and verifier makes even a
// fresh token risk being seen as expired. Validated at construction (fail fast).
const MIN_TTL = 30;

// Throw on a TTL that isn't a positive integer ≥ MIN_TTL.
function assertTtl(value, label) {
  if (!Number.isInteger(value) || value < MIN_TTL) {
    throw new Error(
      `tokenExchangePlugin: ${label} must be an integer ≥ ${MIN_TTL}s (got ${value})`,
    );
  }
}

// Constant-time secret compare, via better-auth's vetted `constantTimeEqual`
// (XORs lengths in — no early-return length leak). An empty provided/expected
// NEVER matches: constantTimeEqual('', '') is true (equal byte-for-byte), so
// without this guard an entry whose secret is '' — e.g. built from an unset env
// var — would authenticate any empty-credential request.
function secretMatches(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  if (provided.length === 0 || expected.length === 0) return false;
  return constantTimeEqual(provided, expected);
}

// Parse `Authorization: Basic base64(client_id:client_secret)` (RFC 6749 client
// auth). Returns null on any malformed header — the caller maps that to 401.
function parseBasicAuth(header) {
  if (typeof header !== 'string' || !header.startsWith('Basic ')) return null;
  let decoded;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return null;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return null;
  // RFC 6749 §2.3.1: client_id and client_secret are form-urlencoded in the Basic
  // value. decodeURIComponent both halves so credentials with reserved chars match
  // the same way the oauth-provider's own /oauth2/token endpoint decodes them.
  try {
    return {
      clientId: decodeURIComponent(decoded.slice(0, sep)),
      clientSecret: decodeURIComponent(decoded.slice(sep + 1)),
    };
  } catch {
    // Malformed percent-encoding — treat as an invalid credential (→ 401).
    return null;
  }
}

/**
 * @param {object} deps
 * @param {string} deps.apiResourceUrl   the default audience minted tokens are
 *   bound to (the in-process API resource id, e.g. https://dapi.openagenda.com/v3)
 *   and the implicit `allowedResources` when a client doesn't restrict it.
 * @param {Record<string, { secret: string, subjectResource: string,
 *   allowedScopes?: string[], allowedResources?: string[], tokenTtl?: number }>}
 *   deps.clients  the first-party service registry, keyed by `client_id`. Each
 *   entry's `secret` authenticates the caller; `subjectResource` (REQUIRED — a
 *   non-empty entry throws at construction) is the ONLY audience whose tokens
 *   that client may exchange (it cannot swap another gateway's tokens); the
 *   optional policy caps which resources/scopes it may mint and, via `tokenTtl`,
 *   the lifetime of the tokens it mints (a
 *   server-set policy — the caller never requests a lifetime — defaulting to
 *   `ttl`). A sandbox-baking service like the MCP wants this short; a service
 *   relaying to a trusted backend may want longer.
 * @param {() => (null | ((token: string) => Promise<null | {
 *   userUid: number, scopes: string[], clientId: string|null, audiences: string[]
 *   }>))} deps.getVerifySubject  late-bound subject-token verifier (bound to the
 *   union of registered `subjectResource`s); built from the better-auth instance,
 *   which only exists after the plugins array is set.
 * @param {() => (null | ((userUid: number) => Promise<boolean>))}
 *   [deps.getCheckSubjectActive]  late-bound check that the subject's user is
 *   still allowed to obtain API access (not removed/blacklisted). Returns null
 *   before the instance is ready (when `getVerifySubject` is null too, so the
 *   request never reaches the check). When it resolves a checker, a falsy result
 *   refuses the exchange — near-instant revocation on the data path without a
 *   per-API-request lookup or a shortened token TTL.
 * @param {object} deps.jwtPluginOptions  the SAME options object passed to
 *   `jwt({...})` — required so `signJWT` reads the right JWKS table and uses the
 *   matching private-key-encryption settings.
 * @param {number} [deps.ttl]  default minted-token lifetime in seconds (default
 *   120), used for any client that doesn't set its own `tokenTtl`.
 */
export default function tokenExchangePlugin({
  apiResourceUrl,
  clients,
  getVerifySubject,
  getCheckSubjectActive,
  jwtPluginOptions,
  ttl = 120,
}) {
  assertTtl(ttl, 'ttl');

  // Every registered client MUST declare a non-empty `subjectResource` — it is
  // the per-client authority boundary (a client may only exchange tokens bound
  // to its own resource). Enforced at construction so a misconfigured entry
  // fails fast at boot rather than silently widening to the whole subject-audience
  // union at request time (the handler check is then unconditional). A per-client
  // `tokenTtl`, when set, is validated the same way as the default `ttl`.
  for (const [clientId, client] of Object.entries(clients)) {
    if (typeof client.subjectResource !== 'string' || !client.subjectResource) {
      throw new Error(
        `tokenExchangePlugin: client '${clientId}' is missing a non-empty subjectResource`,
      );
    }
    if (client.tokenTtl !== undefined) {
      assertTtl(client.tokenTtl, `client '${clientId}' tokenTtl`);
    }
  }

  return {
    id: 'oa-token-exchange',
    endpoints: {
      tokenExchange: createAuthEndpoint(
        '/oauth2/token-exchange',
        {
          method: 'POST',
          requireHeaders: true,
          body: z.object({
            grant_type: z.string(),
            subject_token: z.string(),
            subject_token_type: z.string().optional(),
            // RFC 8707 target resource. Optional; validated against the client's
            // `allowedResources` (default: only `apiResourceUrl`).
            resource: z.string().optional(),
            // Optional down-scope request (space-delimited). Intersected with the
            // subject's scopes (and the client's `allowedScopes`) — never widens.
            scope: z.string().optional(),
          }),
        },
        async (ctx) => {
          // Confidential-client auth: client_secret_basic, looked up by client_id.
          // `Object.hasOwn` guards against inherited keys: a client_id of
          // `constructor`/`toString`/`__proto__` would otherwise resolve a truthy
          // Object.prototype member, leaving the secret check as the only barrier.
          const creds = parseBasicAuth(ctx.headers?.get('authorization'));
          const client = creds && Object.hasOwn(clients, creds.clientId)
            ? clients[creds.clientId]
            : null;
          if (!client || !secretMatches(creds.clientSecret, client.secret)) {
            throw new APIError('UNAUTHORIZED', {
              error: 'invalid_client',
              error_description: 'invalid or missing client credentials',
            });
          }

          const {
            grant_type: grantType,
            subject_token: subjectToken,
            subject_token_type: subjectTokenType,
            resource,
            scope: requestedScope,
          } = ctx.body;

          if (grantType !== GRANT_TYPE) {
            throw new APIError('BAD_REQUEST', {
              error: 'unsupported_grant_type',
              error_description: `grant_type must be ${GRANT_TYPE}`,
            });
          }

          // RFC 8693 §2.1: reject an unsupported subject_token_type. We only
          // exchange access tokens; when present it must say so (absent is
          // tolerated — the JWS verifier is the real gate). This stops a caller
          // from mislabelling the subject as a refresh/id token.
          if (subjectTokenType && subjectTokenType !== ACCESS_TOKEN_TYPE) {
            throw new APIError('BAD_REQUEST', {
              error: 'invalid_request',
              error_description: `subject_token_type must be ${ACCESS_TOKEN_TYPE}`,
            });
          }

          // Target resource: the requested one (when given) or the API default;
          // it must be in the client's allowlist (default: only apiResourceUrl).
          const target = resource ?? apiResourceUrl;
          const allowedResources = client.allowedResources ?? [apiResourceUrl];
          if (!allowedResources.includes(target)) {
            throw new APIError('BAD_REQUEST', {
              error: 'invalid_target',
              error_description: 'resource not allowed for this client',
            });
          }

          // Validate the subject token (signature/issuer/expiry/audience/uid).
          const verifySubject = getVerifySubject();
          const subject = verifySubject
            ? await verifySubject(subjectToken)
            : null;
          if (!subject) {
            throw new APIError('BAD_REQUEST', {
              error: 'invalid_request',
              error_description: 'subject_token is invalid or not exchangeable',
            });
          }

          // A client may only exchange a token bound to ITS OWN gateway resource.
          // The verifier accepts the union of all `subjectResource`s, so this
          // narrows it to the calling client — gateway A cannot swap a token
          // gateway B's resource issued to it. Unconditional: `subjectResource` is
          // guaranteed non-empty by the construction-time check above.
          if (!subject.audiences.includes(client.subjectResource)) {
            throw new APIError('BAD_REQUEST', {
              error: 'invalid_request',
              error_description: 'subject_token is not bound to this client',
            });
          }

          // The subject token's signature/expiry checks out, but the USER behind
          // it may have been banned/removed since it was issued (a JWS access
          // token can't be revoked mid-life — it's verified locally). This
          // exchange is the chokepoint for the data path: the minted `aud=api`
          // token is what reaches the API, and the exchange runs once per gateway
          // call. Refuse it for a no-longer-active user — near-instant revocation
          // without a per-API-request lookup. Late-bound; null only before the
          // instance is ready (when verifySubject is null too, so unreachable).
          const checkActive = getCheckSubjectActive?.();
          if (checkActive) {
            const active = await checkActive(subject.userUid);
            if (!active) {
              throw new APIError('BAD_REQUEST', {
                error: 'invalid_request',
                error_description: 'subject is no longer authorized',
              });
            }
          }

          // Down-scope: minted = subject ∩ requested ∩ client.allowedScopes.
          // Never widens — a scope the subject (or the client policy) lacks drops.
          let { scopes } = subject;
          if (requestedScope) {
            const requested = requestedScope.split(' ').filter(Boolean);
            scopes = scopes.filter((s) => requested.includes(s));
          }
          if (client.allowedScopes) {
            scopes = scopes.filter((s) => client.allowedScopes.includes(s));
          }

          // Per-client lifetime policy (server-set, not caller-requested),
          // falling back to the plugin-wide default.
          const tokenTtl = client.tokenTtl ?? ttl;

          const iat = Math.floor(Date.now() / 1e3);
          const accessToken = await signJWT(ctx, {
            options: jwtPluginOptions,
            payload: {
              // The private `uid` claim every v3 resolver keys on (a JSON number,
              // matching the oauth-provider's `customAccessTokenClaims`).
              uid: subject.userUid,
              aud: target,
              // The OAuth client the user consented to (carried from the subject),
              // not the exchanging service — keeps v3's `req.oauth.clientId` meaningful.
              azp: subject.clientId ?? undefined,
              scope: scopes.join(' '),
              // Explicit issuer, derived EXACTLY as the oauth-provider's own mint
              // path does (createJwtAccessToken: `jwt.issuer ?? ctx.context.baseURL`)
              // so exchanged tokens never diverge from provider-minted ones. The
              // effective issuer (baseURL + basePath) is what the v3 verifier
              // expects; without it, signJWT would default to the bare origin and
              // the issuer check would fail. NB: if `jwt.issuer` is ever set, the
              // in-process verifier (oauthToken.js) must read the same source.
              iss: jwtPluginOptions?.jwt?.issuer ?? ctx.context.baseURL,
              iat,
              exp: iat + tokenTtl,
            },
          });

          return ctx.json({
            access_token: accessToken,
            issued_token_type: ACCESS_TOKEN_TYPE,
            token_type: 'Bearer',
            expires_in: tokenTtl,
            scope: scopes.join(' '),
          });
        },
      ),
    },
  };
}
