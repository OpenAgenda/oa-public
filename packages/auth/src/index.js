import { betterAuth } from 'better-auth';
import { magicLink, jwt } from 'better-auth/plugins';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { getCurrentAuthContext } from '@better-auth/core/context';
import { redisStorage } from '@better-auth/redis-storage';
import { apiKey } from '@better-auth/api-key';
import { oauthProvider } from '@better-auth/oauth-provider';
import { MysqlDialect } from 'kysely';
import generateUid from './generateUid.js';
import createApiKeyHelpers, { hashApiKey } from './apiKey.js';
import createOAuthTokenHelpers from './oauthToken.js';
import gcExpiredRows from './gcExpired.js';
import { isUserActiveByUid, isUserBarred } from './oauthGrants.js';
import createCredentialHelpers from './internalAccount.js';
import oaImpersonationPlugin from './impersonationPlugin.js';
import tokenExchangePlugin from './tokenExchangePlugin.js';
import {
  encodeLegacy,
  hash as hashPassword,
  verify as verifyPassword,
  isLegacy,
} from './password.js';

export function toHeaders(req, prevResponse) {
  const headers = fromNodeHeaders(req.headers);
  if (prevResponse) {
    const setCookies = prevResponse.headers.getSetCookie();
    if (setCookies.length) {
      const incoming = headers.get('cookie') || '';
      const fromSet = setCookies.map((sc) => sc.split(';')[0]).join('; ');
      headers.set('cookie', incoming ? `${incoming}; ${fromSet}` : fromSet);
    }
  }
  return headers;
}

export function forwardSetCookieHeaders(response, res) {
  const cookies = response.headers.getSetCookie();
  if (!cookies.length) return;
  const existing = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [].concat(existing ?? []).concat(cookies));
}

export default function Auth(options = {}) {
  const {
    mysqlPool,
    redis,
    trustedOrigins,
    secret,
    baseURL,
    // The OAuth/OIDC roles below name ROLES, not specific downstream products.
    // Today the API resource is the v3 API and the only exchange client is the
    // MCP HTTP server, but auth's contract describes the mechanism so a second
    // gateway is just another registry entry — no signature change.
    //
    //   - apiResourceUrl: the resource the AS protects IN-PROCESS (the v3 API
    //     runs in the same process — see oauthToken.js, the in-process verifier).
    //     It is the audience that verifier trusts AND the default audience the
    //     token-exchange endpoint mints to. Singular by architecture (the
    //     co-hosted API). Omitted → no in-process delegation at all.
    apiResourceUrl,
    // O2.5 token-exchange (RFC 8693). When `apiResourceUrl` and at least one
    // registered client are set, `/oauth2/token-exchange` is exposed: a
    // first-party service swaps a caller's token (bound to its own
    // `subjectResource`) for a short `aud=apiResourceUrl` token before its
    // sandbox (see tokenExchangePlugin.js).
    //   - exchangeClients: the first-party service registry (client_id → {
    //     secret, subjectResource, allowedScopes?, allowedResources?, tokenTtl? }),
    //     confidential-client auth. `subjectResource` is the audience of the
    //     tokens THIS service presents for exchange — it is also added to the
    //     OAuth provider's issued `validAudiences` so clients can bind to it
    //     (RFC 8707). A second gateway = a second entry with its own resource.
    //   - exchangeTokenTtl: default minted-token lifetime (seconds; default 120).
    exchangeClients = {},
    exchangeTokenTtl,
    schemas = {},
    google,
    facebook,
    onEmailVerified,
    onSendVerificationEmail,
    onSendPasswordResetEmail,
    onExistingUserSignUp,
    onSendMagicLink,
    onAfterOAuthSignUp,
    // Extension callbacks. All optional, all no-op when absent so consumers
    // adopt them progressively. The contract (request shape, semantics)
    // lives in the wiring sites below.
    onSignInSuccess,
    onSignUpComplete,
    validateSignUp,
    onClientRegistered,
  } = options;

  if (!mysqlPool) {
    throw new Error('@openagenda/auth: mysqlPool is required');
  }

  const tables = {
    user: schemas.user ?? 'user',
    // Sessions are primarily Redis-resident (secondaryStorage). The OAuth
    // provider plugin requires `session.storeSessionInDatabase: true` when a
    // secondaryStorage is set (it throws at init otherwise), so sessions are
    // ALSO persisted to this table — Redis stays the read-time source of truth,
    // the DB is a fallback + the FK target for OAuth tokens.
    session: schemas.session ?? 'session',
    account: schemas.account ?? 'account',
    verification: schemas.verification ?? 'verification',
    apiKey: schemas.apiKey ?? 'apikey',
    oauthClient: schemas.oauthClient ?? 'oauth_client',
    oauthAccessToken: schemas.oauthAccessToken ?? 'oauth_access_token',
    oauthRefreshToken: schemas.oauthRefreshToken ?? 'oauth_refresh_token',
    oauthConsent: schemas.oauthConsent ?? 'oauth_consent',
    jwks: schemas.jwks ?? 'jwks',
  };

  // Map the api-key plugin's camelCase schema to OA's snake_case columns
  // (same convention as the account/verification tables above). The model key
  // stays `apikey` (the plugin's internal name); only the physical table and
  // column names are remapped.
  const apiKeyPlugin = apiKey({
    // OA keys carry `metadata.oaKind` — the tier classification verifyKey reads
    // back. Mirror keys also carry `{ source: 'mirror', legacyType }`, used by
    // the UI to keep them fully visible (legacy UX) and by the backfill to
    // scope its upserts. The plugin rejects metadata on create unless this is
    // on (defaults to false → "Metadata is disabled.").
    enableMetadata: true,
    // Keep enough of the generated key in `start` to fit the OA prefix
    // (`oa_pk_`/`oa_sk_`/`oa_ak_`, 6 chars) plus ~6 distinguishing chars, so
    // masked hints stay useful instead of all sk keys collapsing to `oa_sk_`.
    startingCharactersConfig: { charactersLength: 12 },
    // No rate-limit before D6 enforcement — matches the mirror's
    // `rate_limit_enabled: false` (preserve the legacy "no rate limit" OA
    // policy). Reversible: flip this flag for future keys, or update existing
    // rows via SQL; per-key overrides are also supported by `createApiKey`.
    rateLimit: { enabled: false },
    schema: {
      apikey: {
        modelName: tables.apiKey,
        fields: {
          configId: 'config_id',
          referenceId: 'reference_id',
          refillInterval: 'refill_interval',
          refillAmount: 'refill_amount',
          lastRefillAt: 'last_refill_at',
          rateLimitEnabled: 'rate_limit_enabled',
          rateLimitTimeWindow: 'rate_limit_time_window',
          rateLimitMax: 'rate_limit_max',
          requestCount: 'request_count',
          lastRequest: 'last_request',
          expiresAt: 'expires_at',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
    },
  });

  // The OAuth provider signs ID/access tokens with the `jwt` plugin's
  // asymmetric keys (EdDSA) and exposes the public set at `/jwks`. The plugin
  // is NOT auto-registered by oauthProvider — it looks it up via
  // `ctx.getPlugin('jwt')` and throws `jwt_config` if absent — so it must live
  // in `plugins` (before oauthProvider). Disabling it would downgrade signing
  // to symmetric HS256 and drop JWKS, which we want for resource-server
  // (MCP) verification, so it stays enabled. Columns remapped to snake_case.
  // Hoisted to a named object (not an inline literal) so the token-exchange
  // plugin can pass the SAME options to `signJWT` — it needs them to locate the
  // JWKS table (remapped below) and match the private-key encryption settings.
  const jwtPluginOptions = {
    // OAuth-provider mode (per better-auth jwt docs): the OAuth flow drives all
    // JWT issuance, so the plugin must NOT also stamp a `set-auth-jwt` header on
    // session responses — that role is served by `/oauth2/userinfo`. The plugin's
    // own `/token` endpoint is likewise disabled below via `disabledPaths`
    // (superseded by `/oauth2/token`).
    disableSettingJwtHeader: true,
    schema: {
      jwks: {
        modelName: tables.jwks,
        fields: {
          publicKey: 'public_key',
          privateKey: 'private_key',
          createdAt: 'created_at',
          expiresAt: 'expires_at',
        },
      },
    },
  };
  const jwtPlugin = jwt(jwtPluginOptions);

  // OpenAgenda as an OAuth 2.1 / OIDC provider (SSO + MCP HTTP auth). O0 wires
  // the plugin additively: tables + discovery endpoints exist, but no client is
  // registered and dynamic client registration stays OFF (default) until O3.
  // Scopes = OIDC core + the v3 key vocabulary (resource:action) so an OAuth
  // access token caps the operation exactly like an `oa_sk_` key does, while
  // the visibility tier still comes from the consenting user's role (see
  // docs/plan-oauth-provider.md §2.4 and docs/plan-slice-auth-v3.md §5.1/§5.2).
  // Each registered exchange client declares the `subjectResource` its inbound
  // tokens are bound to (the MCP's own resource, today). These are the gateway
  // audiences — distinct from the in-process `apiResourceUrl`, which the exchange
  // MINTS but no OAuth client binds to directly.
  const subjectResources = [
    ...new Set(
      Object.values(exchangeClients)
        .map((c) => c.subjectResource)
        .filter(Boolean),
    ),
  ];

  // Audiences a client may bind a token to via `resource` (RFC 8707): the AS
  // origin (`baseURL` — OIDC/userinfo, and "Sign in with OpenAgenda" SSO clients
  // bind here), every gateway's `subjectResource` (the MCP resource), and the
  // in-process v3 API (`apiResourceUrl`). This is the oauth-provider's
  // `checkResource` allowlist — the `resource` values it accepts at
  // /authorize|token.
  //
  // `apiResourceUrl` is bindable DIRECTLY: a public client (an in-browser API
  // explorer, an SPA) requests `resource=<v3>` and gets a JWS `aud=v3` token the
  // resource server verifies offline — the canonical RFC 8707 pattern. The
  // token-exchange path STILL mints `aud=v3` server-side for confidential
  // gateways (the MCP), whose sandbox needs the consented token kept out and a
  // short TTL; that hardening is gateway-specific, not a reason to hide a
  // legitimate resource from direct clients. v3 is audience-checked either way,
  // and consent + scopes + the per-request blacklist stay the authz controls.
  const validAudiences = [
    baseURL,
    ...subjectResources,
    ...apiResourceUrl ? [apiResourceUrl] : [],
  ];

  // The in-process verifier accepts a NARROWER set than the AS issues for: only
  // the API resource id (`aud=api`), NOT the bare AS origin and NOT any gateway
  // resource. O2.5 made token-exchange the SINGLE delegation path: a gateway
  // always swaps its own token for an `aud=api` token before reaching the API
  // (see tokenExchangePlugin.js), so a raw gateway token (the old B2 passthrough)
  // and an SSO/OIDC token bound to `baseURL` are BOTH rejected as API credentials.
  // Empty when no `apiResourceUrl` (no in-process delegation at all; API keys
  // still work) — never falls back to honouring a gateway audience.
  const apiAudiences = apiResourceUrl ? [apiResourceUrl] : [];

  // First-party clients that skip the consent screen (none today). The GC reads
  // the same list to avoid deleting them (they have no consent row to vouch for
  // them). When this gains entries, each is `{ clientId, … }`.
  const trustedClients = [];

  const oauthProviderPlugin = oauthProvider({
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'me:read',
      'events:read',
      'events:write',
      'events:transverse',
      'agendas:read',
      'agendas:write',
      'locations:read',
      'locations:write',
      'members:read',
      'members:write',
    ],
    // O1 — interactive flow pages (OA frontend, Next App Router). The plugin
    // appends the signed authorization query to these paths and 302s the
    // browser there. Paths are locale-less by convention (proxy.ts resolves the
    // locale; cf. the existing `/auth/signin?msg=…` redirect below).
    //   - loginPage: unauthenticated `/oauth2/authorize` lands on the existing
    //     sign-in page, which maps the OAuth query into its `redirect` param so
    //     the user bounces back to `/oauth2/authorize` once logged in.
    //   - consentPage: authenticated-but-not-yet-consented lands here; the page
    //     POSTs `/oauth2/consent` and follows the returned `redirect_uri`.
    loginPage: '/auth/signin',
    consentPage: '/auth/consent',
    // Carry the OA uid as a private claim on the access token. The token's `sub`
    // is the better-auth user row id (a serial PK), which is NOT the OpenAgenda
    // uid that every downstream resolver keys on (`core.users.get(uid)`, the
    // api-key `referenceId`). They differ for ALL users. So a resource server
    // (the v3 API) reads `uid` from this claim to resolve the OA user, keeping
    // the token self-describing (no per-request id→uid lookup). A JSON NUMBER:
    // OA uids are bounded < 2^48 (generateUid) — comfortably inside 2^53 — so the
    // wire value is exact and matches the `number` type uid carries everywhere
    // else (no string round-trip). `sub` is left untouched (stable OIDC subject;
    // SSO continuity, O1 flow).
    customAccessTokenClaims: async ({ user }) =>
      (user?.uid != null ? { uid: Number(user.uid) } : {}),
    // Standard 1h access-token TTL (the plugin default). This was clamped to
    // 600s under the B2 model (O2) because the consented `aud=mcp` token was
    // relayed verbatim into the sandbox for the duration of an `execute`, and a
    // short life bounded that exposure. O2.5 removes the coupling: the MCP now
    // token-exchanges that token for a SEPARATE short-lived `aud=api` token
    // (exchangeTokenTtl, ~120s — see tokenExchangePlugin.js) before the sandbox,
    // so the consented/SSO token never enters one. Its TTL no longer needs to be
    // short for that reason → restored to 1h for SSO/OIDC/API consumers.
    accessTokenExpiresIn: 3600,
    // Dynamic Client Registration (RFC 7591 — O3). MCP clients (Claude, etc.)
    // are public and discover us at runtime: they cannot use a pre-shared
    // client_id, so they self-register at `/oauth2/register` before the user
    // ever logs in. Hence BOTH flags:
    //   - allowDynamicClientRegistration: exposes `/oauth2/register` and adds
    //     `registration_endpoint` to the AS metadata (clients discover it).
    //   - allowUnauthenticatedClientRegistration: registration happens with no
    //     session (the standard MCP ordering is register → authorize → token).
    // Security posture without a scope cap: a registered client may REQUEST any
    // scope in `scopes` above, but it gets nothing until the user approves it on
    // the consent screen (never skipped for DCR clients — `trustedClients` is
    // empty). Combined with the short access-token TTL and the `/oauth2/register`
    // rate limit (plugin default: 5/min/IP), an open registration endpoint stays
    // bounded. Tighten later via `clientRegistrationAllowedScopes` once the write
    // surface and per-tool scope enforcement land (O2.5+).
    allowDynamicClientRegistration: true,
    allowUnauthenticatedClientRegistration: true,
    // First-party OA apps that should skip the consent screen go here
    // (`{ clientId, clientSecret, redirectURLs, skipConsent: true, … }`).
    // Empty until a first-party client is registered (→ O3). Hoisted to a const
    // so the GC (gcExpired) can exclude them: a skip-consent client has NO
    // `oauthConsent` row, so the "no consent ⇒ unused" rule would otherwise
    // delete it.
    trustedClients,
    // Audiences a client may bind a token to via the `resource` parameter
    // (RFC 8707). `checkResource` rejects any `resource` not listed here. A
    // resource-bound request yields a JWS access token (`aud` set) the resource
    // server verifies locally; without `resource` the token is opaque. baseURL
    // stays valid (the userinfo audience is auto-added for `openid`); gateways'
    // `subjectResource` and the v3 `apiResourceUrl` are added (see validAudiences
    // above). Only override the plugin's `[baseURL]` default when we actually
    // widen it — i.e. `validAudiences` carries more than baseURL alone.
    ...validAudiences.length > 1 ? { validAudiences } : {},
    schema: {
      oauthClient: {
        modelName: tables.oauthClient,
        fields: {
          clientId: 'client_id',
          clientSecret: 'client_secret',
          skipConsent: 'skip_consent',
          enableEndSession: 'enable_end_session',
          subjectType: 'subject_type',
          userId: 'user_id',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          softwareId: 'software_id',
          softwareVersion: 'software_version',
          softwareStatement: 'software_statement',
          redirectUris: 'redirect_uris',
          postLogoutRedirectUris: 'post_logout_redirect_uris',
          tokenEndpointAuthMethod: 'token_endpoint_auth_method',
          grantTypes: 'grant_types',
          responseTypes: 'response_types',
          requirePKCE: 'require_pkce',
          referenceId: 'reference_id',
        },
      },
      oauthAccessToken: {
        modelName: tables.oauthAccessToken,
        fields: {
          clientId: 'client_id',
          sessionId: 'session_id',
          userId: 'user_id',
          referenceId: 'reference_id',
          refreshId: 'refresh_id',
          expiresAt: 'expires_at',
          createdAt: 'created_at',
        },
      },
      oauthRefreshToken: {
        modelName: tables.oauthRefreshToken,
        fields: {
          clientId: 'client_id',
          sessionId: 'session_id',
          userId: 'user_id',
          referenceId: 'reference_id',
          expiresAt: 'expires_at',
          createdAt: 'created_at',
          authTime: 'auth_time',
        },
      },
      oauthConsent: {
        modelName: tables.oauthConsent,
        fields: {
          clientId: 'client_id',
          userId: 'user_id',
          referenceId: 'reference_id',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
    },
  });

  // O2.5 token-exchange. Built only when the API resource id and at least one
  // registered first-party client are configured. The subject-token verifier is
  // LATE-BOUND: it needs the built `instance` (for the JWKS), which only exists
  // after this plugins array is constructed — so the endpoint reads it through a
  // getter resolved at request time (populated just after `betterAuth()` below).
  //
  // Fail FAST on the asymmetric misconfig: exchange clients registered but no
  // `apiResourceUrl` (e.g. the secret is set but API_ROOT is not). Silently
  // dropping the endpoint here would leave the in-process verifier with an empty
  // audience set (rejecting every delegated call) while clients still receive
  // gateway-bound tokens nothing can honour — a broken-but-healthy-looking AS.
  if (Object.keys(exchangeClients).length && !apiResourceUrl) {
    throw new Error(
      '@openagenda/auth: exchangeClients are registered but apiResourceUrl is '
        + 'unset (is API_ROOT / OA_V3_RESOURCE_URL configured?). The token-exchange '
        + 'endpoint cannot mint or verify without it.',
    );
  }
  let verifyExchangeSubject = null;
  let checkExchangeSubjectActive = null;
  const exchangePlugin = apiResourceUrl && Object.keys(exchangeClients).length
    ? tokenExchangePlugin({
      apiResourceUrl,
      clients: exchangeClients,
      getVerifySubject: () => verifyExchangeSubject,
      getCheckSubjectActive: () => checkExchangeSubjectActive,
      jwtPluginOptions,
      ...exchangeTokenTtl ? { ttl: exchangeTokenTtl } : {},
    })
    : null;

  const baOptions = {
    database: { dialect: new MysqlDialect({ pool: mysqlPool }), type: 'mysql' },
    secret,
    baseURL,
    trustedOrigins,
    // OAuth-provider mode: disable the jwt plugin's standalone `/token` endpoint
    // (replaced by `/oauth2/token`). Required per the better-auth jwt docs to
    // avoid duplicating the OAuth token endpoint. Nothing in OA consumes the
    // bare `/api/auth/token` route (the jwt plugin was added in this change).
    disabledPaths: ['/token'],
    // `apiKeyPlugin` runs with enableSessionForAPIKeys=false (default): it adds
    // the api-key endpoints + `apikey` table but does NOT intercept requests or
    // open sessions from an x-api-key header. The v3 API resolves keys itself
    // via auth.api.verifyApiKey, keeping full control of the error envelope.
    // `jwtPlugin` precedes `oauthProviderPlugin` because the latter resolves the
    // former at init via ctx.getPlugin('jwt').
    plugins: [
      oaImpersonationPlugin(),
      apiKeyPlugin,
      // Passwordless sign-in. The UI POSTs straight to BA's
      // /sign-in/magic-link (like sign-in/email); all gating (anti-enumeration,
      // per-email throttle, blacklist) lives in the `onSendMagicLink` callback
      // (cibul-node services/auth), so no client plugin is wired.
      magicLink({
        // 10 min: comfortable margin for email delivery without leaving a live
        // link too long (BA default is 300s). Bump to 900 if SMTP latency
        // proves higher in practice.
        expiresIn: 600,
        // Magic-link never creates an account — it only signs in an existing
        // one. New-account onboarding stays on the dedicated signup flow
        // (users.create mirror, culture, redirectToComplete, invitation
        // linking). The `onSendMagicLink` callback routes unknown emails to a
        // "create an account" CTA mail instead.
        disableSignUp: true,
        // Only the SHA-256 hash of the token lands in the `verification` table;
        // the raw token lives only in the email. Affordable here because the
        // blacklist guard runs in the after-hook (reads the user from the
        // fresh session, never looks the token back up) — nothing in our code
        // reads the stored token, and BA hashes the incoming token the same
        // way to consume it.
        storeToken: 'hashed',
        // Per-IP (covers /sign-in/magic-link + /magic-link/verify via the
        // plugin's pathMatcher). Kept at the BA default — not tightened, since
        // a corporate NAT funnels many users through one IP. The real control
        // is the per-email throttle in `onSendMagicLink` (redis).
        rateLimit: { window: 60, max: 5 },
        sendMagicLink: async ({ email, url, token, metadata }, request) => {
          if (typeof onSendMagicLink === 'function') {
            await onSendMagicLink({ email, url, token, metadata }, request);
          }
        },
      }),
      jwtPlugin,
      oauthProviderPlugin,
      // After oauthProviderPlugin so `/oauth2/token-exchange` sits alongside the
      // other `/oauth2/*` endpoints; uses signJWT (jwtPlugin) to mint. Filtered
      // out when not configured.
      ...exchangePlugin ? [exchangePlugin] : [],
    ],
    advanced: {
      cookiePrefix: 'oa',
      cookies: {
        // BA's default name `oa.session_data` matches Sentry's sensitive-header
        // snippet `session` and gets value-filtered to `[Filtered]` on span
        // attributes, blocking downstream uid/culture extraction for tracing.
        // Abbreviating `session` → `sess` sidesteps the filter while staying
        // recognizable. `oa.session_token` keeps its name (which IS sensitive,
        // deserves filtering); the cache cookie holding the projected user can
        // now be read by the spanStart hook.
        session_data: { name: 'oa.sess_data' },
      },
      database: {
        generateId: 'serial',
      },
    },
    socialProviders: {
      ...google?.id && {
        google: {
          clientId: google.id,
          clientSecret: google.secret,
          // BA invokes `mapProfileToUser` on every OAuth callback, after the
          // id_token is decoded but before `handleOAuthUserInfo` runs. Its
          // documented role is profile→user field mapping; we exploit its
          // unconditional invocation as a side-effect window to stash the
          // provider email on the request-scoped async-context, where the
          // `after` hook below picks it up to enrich the error redirect with
          // `&email=<encoded>` (verified-linking flow pre-fills the form).
          //
          // `image: null` overrides BA's default `image: user.picture` mapping
          // (core/src/social-providers/google.ts spreads `...userMap` after the
          // default). OA stores `user.image` as an S3 key and concatenates the
          // CDN prefix on read — keeping the full Google CDN URL there produces
          // `https://cdn.openagenda.com/https://lh3.googleusercontent.com/...`.
          mapProfileToUser: async (profile) => {
            try {
              const ctx = await getCurrentAuthContext();
              if (ctx && profile?.email) {
                ctx.context.oaCallbackEmail = profile.email;
              }
            } catch {
              // Best-effort: outside an endpoint scope `getCurrentAuthContext`
              // throws, the email pre-fill silently no-ops.
            }
            return { image: null };
          },
        },
      },
      ...facebook?.id && {
        facebook: {
          clientId: facebook.id,
          clientSecret: facebook.secret,
          fields: ['id', 'name', 'email'],
          // Phase-out: signin only, no signup. Users without a backfilled
          // `account` row see `?error=signup_disabled` rather than getting
          // silently auto-created.
          disableImplicitSignUp: true,
          // Same rationale as Google above: drop the provider-side picture so
          // OA's `user.image` stays a (possibly null) S3 key, not a full URL.
          mapProfileToUser: () => ({ image: null }),
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      // No active session before the email is verified. Aligns with the
      // legacy OA contract (`is_activated=0` users cannot sign-in).
      requireEmailVerification: true,
      autoSignIn: false,
      // Custom argon2id hash for new credentials, multi-format verify that
      // also accepts the legacy sentinel formats written by phase 2a + the
      // backfill migration. New writes go to argon2id; existing legacy rows
      // stay readable until the lazy-rehash hook below rotates them.
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
      sendResetPassword: async ({ user, url, token }, request) => {
        if (typeof onSendPasswordResetEmail === 'function') {
          await onSendPasswordResetEmail({ user, url, token }, request);
        }
      },
      // Fires only on the duplicate-email branch of /sign-up/email (BA's
      // `shouldReturnGenericDuplicateResponse`, on because of
      // `requireEmailVerification`). BA runs it via `runInBackgroundOrAwait`
      // AFTER it has already hashed the supplied password to flatten timing,
      // so the screen response stays generic and constant-time regardless of
      // whether the account exists. This is the private "email channel": it
      // lets the consumer notify the real owner (a signup was attempted, an
      // account already exists) without the screen ever leaking existence.
      onExistingUserSignUp: async ({ user }, request) => {
        if (typeof onExistingUserSignUp === 'function') {
          await onExistingUserSignUp({ user }, request);
        }
      },
    },
    hooks: {
      // Block sign-in for soft-removed or blacklisted users. Phase 2.5 deletes
      // the credential row on remove (so removed users fail naturally) and
      // revokes sessions on blacklist (but keeps the row, since blacklist is
      // reversible). Without this guard, a blacklisted user could re-signin.
      // For OAuth, the equivalent guard runs in the after-hook on
      // `/callback/:id` (the email is unknown until the provider replies).
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === '/sign-in/email') {
          const email = ctx.body?.email;
          if (typeof email !== 'string') return;
          const found = await ctx.context.internalAdapter.findUserByEmail(email);
          const user = found?.user;
          if (user && isUserBarred(user)) {
            throw new APIError('UNAUTHORIZED', {
              code: 'INVALID_EMAIL_OR_PASSWORD',
              message: 'Invalid email or password',
            });
          }
          return;
        }

        // Extension point for sign-up validation (captcha, password
        // complexity, …). The callback returns either a falsy value (=> let
        // BA proceed) or an object with `errors` (=> reject with HTTP 400).
        // Throwing inside the callback is also honoured — APIError
        // propagates as-is, anything else is rewrapped in BAD_REQUEST.
        if (
          ctx.path === '/sign-up/email'
          && typeof validateSignUp === 'function'
        ) {
          let result;
          try {
            result = await validateSignUp({
              body: ctx.body,
              request: ctx.request,
            });
          } catch (err) {
            if (err instanceof APIError) throw err;
            throw new APIError('BAD_REQUEST', {
              message: err?.message || 'Sign-up validation failed',
            });
          }
          if (result && result.errors) {
            throw new APIError('BAD_REQUEST', {
              message: 'Sign-up validation failed',
              details: result.errors,
            });
          }
          return;
        }

        // /reset-password consumes the verification record (deleteVerificationByIdentifier)
        // before returning, so the after-hook can no longer recover the userId from BA's
        // ctx. Stash it here while the verification is still resolvable. The shared
        // `ctx.context` object survives into the after-hook (see to-auth-endpoints.mjs:
        // internalContext.context is the same reference for before/handler/after).
        if (ctx.path === '/reset-password') {
          const token = ctx.body?.token || ctx.query?.token;
          if (typeof token !== 'string') return;
          try {
            const verification = await ctx.context.internalAdapter.findVerificationValue(
              `reset-password:${token}`,
            );
            if (verification && verification.expiresAt >= new Date()) {
              ctx.context.oaResetUserId = verification.value;
            }
          } catch (err) {
            ctx.context.logger?.error?.('reset-password lookup failed', {
              err,
            });
          }
        }
      }),
      // Lazy-rehash: on a successful sign-in, if the stored hash is one of
      // the legacy sentinel formats, rewrite it to argon2id. Errors are
      // swallowed — the user is already signed in, the rehash will retry on
      // the next sign-in, and the backfill migration is the source of truth.
      after: createAuthMiddleware(async (ctx) => {
        // O3 — audit every successful OAuth client registration (DCR is public,
        // so this is the abuse-visibility seam). The oauth-provider exposes no
        // registration hook, so we observe the response: `ctx.context.returned`
        // is the issued client on success, or an APIError (no `client_id`) on a
        // validation/rate-limit failure — which we skip, so rejected attempts
        // never pollute the audit trail. The descriptor is sanitized (NEVER the
        // `client_secret`); a failure in the host callback must not break the
        // registration, so it is swallowed (logged) like the other extension hooks.
        if (ctx.path === '/oauth2/register') {
          if (typeof onClientRegistered !== 'function') return;
          const client = ctx.context.returned;
          if (!client || typeof client !== 'object' || !client.client_id) {
            return;
          }
          const header = (name) =>
            ctx.headers?.get?.(name)
            ?? ctx.request?.headers?.get?.(name)
            ?? null;
          const forwardedFor = header('x-forwarded-for');
          try {
            await onClientRegistered({
              clientId: client.client_id,
              clientName: client.client_name ?? null,
              redirectUris: client.redirect_uris ?? [],
              tokenEndpointAuthMethod:
                client.token_endpoint_auth_method ?? null,
              grantTypes: client.grant_types ?? null,
              softwareId: client.software_id ?? null,
              softwareVersion: client.software_version ?? null,
              clientUri: client.client_uri ?? null,
              // null ⇒ anonymous DCR (no session); a uid ⇒ a signed-in user
              // registered it — a key signal when triaging the audit log.
              registeredBy: client.user_id ?? null,
              // We sit behind nginx, so the caller IP is the first X-Forwarded-For
              // hop; null when absent rather than logging a proxy address.
              ip: forwardedFor ? forwardedFor.split(',')[0].trim() : null,
              userAgent: header('user-agent'),
            });
          } catch (err) {
            ctx.context.logger?.error?.('onClientRegistered failed', { err });
          }
          return;
        }

        if (ctx.path === '/sign-in/email') {
          const { newSession } = ctx.context;
          if (!newSession) return;
          const userId = newSession.user.id;
          try {
            const accounts = await ctx.context.internalAdapter.findAccountByUserId(userId);
            const credential = accounts.find(
              (a) => a.providerId === 'credential',
            );
            if (credential?.password && isLegacy(credential.password)) {
              // Guard against future BA versions reshaping the request body:
              // argon2.hash(undefined) throws, the surrounding try/catch
              // swallows it, and the legacy hash would never rotate.
              if (typeof ctx.body?.password === 'string') {
                // internalAdapter.updatePassword writes the value directly; we
                // must hash here. ctx.context.password.hash mirrors our custom
                // hash.
                const newHash = await ctx.context.password.hash(
                  ctx.body.password,
                );
                await ctx.context.internalAdapter.updatePassword(
                  userId,
                  newHash,
                );
              }
            }
          } catch (err) {
            ctx.context.logger?.error?.('lazy rehash failed', { userId, err });
          }

          // Errors are logged but do not propagate — the user is already
          // signed in, blocking the response on a post-signin side-effect
          // (lastSignin refresh, FB unlink redirect, …) would degrade UX
          // with no security benefit.
          if (typeof onSignInSuccess === 'function') {
            try {
              await onSignInSuccess({
                session: newSession.session,
                user: newSession.user,
                request: ctx.request,
              });
            } catch (err) {
              ctx.context.logger?.error?.('onSignInSuccess failed', {
                userId,
                err,
              });
            }
          }
          return;
        }

        // OAuth callback post-processing (phase 4):
        //   1. guard isRemoved/isBlacklisted — purge the just-created session
        //      and redirect to /signin with an error param;
        //   2. preserve the legacy Facebook phase-out: any user landing with
        //      `facebookUid !== null` is forced to /settings/unlinkFacebook
        //      regardless of the originating provider.
        // The endpoint path is the BA pattern `/callback/:id`; provider name
        // is in `ctx.params.id`. setSessionCookie ran inside the route handler
        // so `ctx.context.newSession` is populated and the Set-Cookie is
        // already in `responseHeaders`.
        if (ctx.path === '/callback/:id') {
          const provider = ctx.params?.id;
          if (provider !== 'google' && provider !== 'facebook') return;
          const { newSession } = ctx.context;

          // Error path: BA threw a redirect to `errorCallbackURL?error=...`
          // (account_not_linked, signup_disabled, …). The verified-linking
          // flow needs the provider email to pre-fill the signin form;
          // `mapProfileToUser` stashed it on the async-context just before
          // BA's `handleOAuthUserInfo` decided to refuse the link.
          if (!newSession) {
            const location = ctx.context.responseHeaders?.get('location');
            const email = ctx.context.oaCallbackEmail;
            if (
              location
              && email
              && location.includes('error=account_not_linked')
              && !location.includes('email=')
            ) {
              const sep = location.includes('?') ? '&' : '?';
              ctx.context.responseHeaders.set(
                'location',
                `${location}${sep}email=${encodeURIComponent(email)}`,
              );
            }
            return;
          }
          const userId = newSession.user.id;
          let user;
          try {
            user = await ctx.context.internalAdapter.findUserById(userId);
          } catch (err) {
            ctx.context.logger?.error?.('oauth callback findUserById failed', {
              userId,
              err,
            });
            return;
          }
          if (!user) return;

          if (isUserBarred(user)) {
            try {
              await ctx.context.internalAdapter.deleteUserSessions(
                String(userId),
              );
            } catch (err) {
              ctx.context.logger?.error?.(
                'oauth callback deleteUserSessions failed',
                {
                  userId,
                  err,
                },
              );
            }
            ctx.context.responseHeaders?.set(
              'location',
              '/auth/signin?msg=accountUnavailable',
            );
            return;
          }

          if (user.facebookUid) {
            ctx.context.responseHeaders?.set(
              'location',
              '/settings/unlinkFacebook',
            );
          }

          // Same error policy as /sign-in/email: log and continue. The
          // OAuth redirect is already in flight via `responseHeaders.location`.
          if (typeof onSignInSuccess === 'function') {
            try {
              await onSignInSuccess({
                session: newSession.session,
                user: newSession.user,
                request: ctx.request,
              });
            } catch (err) {
              ctx.context.logger?.error?.('onSignInSuccess failed', {
                userId,
                err,
              });
            }
          }
          return;
        }

        // After a successful /reset-password, mirror the legacy OA behaviour:
        // receiving the reset email == proof of access to the inbox == implicit
        // activation. BA does not flip emailVerified on reset by default.
        // The userId was stashed in `before` (the verification record is
        // already consumed by the time we get here).
        if (ctx.path === '/reset-password') {
          const userId = ctx.context.oaResetUserId;
          if (!userId) return;
          // ctx.context.returned holds the route's response. An APIError instance
          // here means the reset failed (bad password length, invalid token mid-route, etc.).
          if (ctx.context.returned instanceof APIError) return;
          try {
            const user = await ctx.context.internalAdapter.findUserById(userId);
            if (user && !user.emailVerified) {
              await ctx.context.internalAdapter.updateUser(userId, {
                emailVerified: true,
              });
              // afterEmailVerification fires off the /verify-email path, not on
              // a direct updateUser. Invoke onEmailVerified manually so
              // runOnActivation (idempotent) runs exactly once, regardless of
              // whether the user was activated via verify-email or via reset.
              if (typeof onEmailVerified === 'function') {
                const refreshed = { ...user, emailVerified: true };
                await onEmailVerified(refreshed, ctx.request);
              }
            }
          } catch (err) {
            ctx.context.logger?.error?.('reset-password activation failed', {
              userId,
              err,
            });
          }
        }

        // Magic-link sign-in post-processing. BA's /magic-link/verify creates
        // the session inside the route handler (newSession is populated, the
        // Set-Cookie is already in responseHeaders) and redirects to the
        // callbackURL — but it does NOT run the /sign-in/email before-guard nor
        // afterEmailVerification. So we replicate both side-effects here:
        //   1. Blacklist/removed guard (defense in depth — `onSendMagicLink`
        //      is the primary gate but a user can be banned between send and
        //      click). Same shape as the /callback/:id OAuth guard above.
        //   2. Activation: BA already flipped emailVerified inside the handler;
        //      we relay to onEmailVerified → runOnActivation (idempotent), so a
        //      not-yet-activated user gets activated exactly once and an
        //      already-active one is a no-op.
        //   3. onSignInSuccess (lastSignin refresh), like the other paths.
        if (ctx.path === '/magic-link/verify') {
          const { newSession } = ctx.context;
          if (!newSession) return;
          const userId = newSession.user.id;
          let user;
          try {
            user = await ctx.context.internalAdapter.findUserById(userId);
          } catch (err) {
            ctx.context.logger?.error?.('magic-link findUserById failed', {
              userId,
              err,
            });
            return;
          }
          if (!user) return;

          if (isUserBarred(user)) {
            try {
              await ctx.context.internalAdapter.deleteUserSessions(
                String(userId),
              );
            } catch (err) {
              ctx.context.logger?.error?.(
                'magic-link deleteUserSessions failed',
                {
                  userId,
                  err,
                },
              );
            }
            // Neutralize the session cookies BA already queued, so the banned
            // user is not left with a valid signed `oa.sess_data` cookieCache
            // (good for up to its maxAge). This is stricter than the OAuth
            // /callback path, which leaves the gap open.
            ctx.context.responseHeaders?.delete('set-cookie');
            ctx.context.responseHeaders?.set(
              'location',
              '/auth/signin?msg=accountUnavailable',
            );
            return;
          }

          if (typeof onEmailVerified === 'function') {
            try {
              await onEmailVerified(user, ctx.request);
            } catch (err) {
              ctx.context.logger?.error?.('magic-link onEmailVerified failed', {
                userId,
                err,
              });
            }
          }

          if (typeof onSignInSuccess === 'function') {
            try {
              await onSignInSuccess({
                session: newSession.session,
                user: newSession.user,
                request: ctx.request,
              });
            } catch (err) {
              ctx.context.logger?.error?.('onSignInSuccess failed', {
                userId,
                err,
              });
            }
          }
        }
      }),
    },
    session: {
      modelName: tables.session,
      // Sessions stay Redis-resident for reads (secondaryStorage + cookieCache);
      // the tracing fast-path is unaffected. `storeSessionInDatabase: true` adds
      // a write to the `session` table on create/update — required by the OAuth
      // provider plugin (it throws at init when secondaryStorage is set without
      // it) and gives OAuth tokens a real FK target. Reads still hit Redis first,
      // DB on miss.
      //
      // With storeSessionInDatabase enabled, the field-converter strips any
      // undeclared session field BEFORE the row is cached back into Redis (the
      // DB-create result is what `createSession` re-stores under `active-sessions`),
      // so an ad-hoc field is lost everywhere — not just in the DB. The
      // impersonation plugin's `impersonatedBy` (mirrors better-auth's admin
      // plugin) must therefore be declared as an additional field with a real
      // `impersonated_by` column, or `/signout` can't detect a "sign as" session.
      storeSessionInDatabase: true,
      fields: {
        userId: 'user_id',
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
      },
      additionalFields: {
        impersonatedBy: {
          type: 'string',
          required: false,
          // Set only via the oa-impersonation plugin's internal createSession
          // override, never from request input.
          input: false,
          fieldName: 'impersonated_by',
        },
      },
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60,
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      afterEmailVerification: async (user, request) => {
        if (typeof onEmailVerified === 'function') {
          await onEmailVerified(user, request);
        }
      },
      sendVerificationEmail: async ({ user, url, token }, request) => {
        if (typeof onSendVerificationEmail === 'function') {
          await onSendVerificationEmail({ user, url, token }, request);
        }
      },
    },
    rateLimit: {
      // Force-enabled regardless of NODE_ENV. BA defaults `enabled` to
      // `isProduction` so dev runs have rate-limit OFF — but the email-spam
      // protection on these two endpoints is just as relevant in staging
      // and integration tests, and the customRules below cap at 1/min so
      // ordinary smoke testing won't trip them.
      enabled: true,
      // Tighter than BA defaults (60s/3) on the two endpoints that fan-out
      // to a real email send, to mitigate email-spam abuse on a known address.
      // Note: BA 1.6.x exposes `/request-password-reset` (alias for the
      // legacy "forget-password"); the rule key tracks the actual route.
      customRules: {
        '/send-verification-email': { window: 60, max: 1 },
        '/request-password-reset': { window: 60, max: 1 },
        // /sign-up/email also fans out to a real email on the duplicate-account
        // branch (the `onExistingUserSignUp` notice / activation resend), so a
        // known address could be mail-bombed via repeated signup POSTs. Cap it
        // per-IP. A touch looser than 1/min since a genuine user may retry a
        // mistyped form a couple of times.
        '/sign-up/email': { window: 60, max: 3 },
      },
    },
    account: {
      modelName: tables.account,
      // Verified linking: at OAuth callback time, BA never silently links an
      // existing user — `disableImplicitLinking` forces an explicit
      // password challenge step (the `linkProvider` flow in cibul-node's
      // /signin handler, which calls `/link-social` post-signin).
      //
      // `trustedProviders: ['google']` whitelists Google for the explicit
      // `/link-social` path (which itself rejects untrusted-and-not-verified
      // providers). Facebook stays out of the trusted list — its
      // `email_verified` is always false BA-side, so `/link-social` would
      // refuse it anyway, which matches the FB phase-out policy.
      accountLinking: {
        disableImplicitLinking: true,
        trustedProviders: ['google'],
      },
      fields: {
        userId: 'user_id',
        accountId: 'account_id',
        providerId: 'provider_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        idToken: 'id_token',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    verification: {
      modelName: tables.verification,
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    secondaryStorage: redis
      ? redisStorage({ client: redis, keyPrefix: '{better-auth}:' })
      : undefined,
    user: {
      modelName: tables.user,
      fields: {
        name: 'full_name',
        emailVerified: 'is_activated',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      additionalFields: {
        uid: {
          type: 'number',
          bigint: true,
          input: false,
          returned: true,
          defaultValue: () => generateUid(),
        },
        salt: {
          type: 'string',
          input: false,
          returned: false,
          defaultValue: '',
        },
        // Surfaced so the sign-in guard (hooks.before) can read them off the
        // user object returned by `internalAdapter.findUserByEmail`.
        // `isBlacklisted` is also returned on the BA user output so consumers
        // can read it natively off the session.
        isRemoved: {
          type: 'boolean',
          fieldName: 'is_removed',
          input: false,
          returned: false,
          defaultValue: false,
        },
        isBlacklisted: {
          type: 'boolean',
          fieldName: 'is_blacklisted',
          input: false,
          returned: true,
          defaultValue: false,
        },
        culture: {
          type: 'string',
          fieldName: 'culture',
          input: true,
          returned: true,
          defaultValue: 'fr',
        },
        // Surfaced so the OAuth callback after-hook can detect users still
        // carrying a Facebook link (phase-out → force /settings/unlinkFacebook).
        facebookUid: {
          type: 'string',
          fieldName: 'facebook_uid',
          input: false,
          returned: false,
          defaultValue: null,
        },
        transverseApiAccess: {
          type: 'boolean',
          fieldName: 'transverse_api_access',
          input: false,
          returned: true,
          defaultValue: false,
        },
        isNew: {
          type: 'boolean',
          fieldName: 'is_new',
          input: false,
          returned: true,
          defaultValue: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (createdUser, context) => {
            const path = context?.path;

            // Fires on EVERY user creation (email/pwd signup AND OAuth
            // signup) — broader than `onAfterOAuthSignUp` so callers can
            // hook into the /sign-up/email path too. The user is NOT yet
            // activated for /sign-up/email; the callback must not assume
            // `isActivated=true`.
            if (typeof onSignUpComplete === 'function') {
              try {
                await onSignUpComplete(createdUser, context?.request);
              } catch (err) {
                context?.logger?.error?.('onSignUpComplete failed', {
                  userId: createdUser?.id,
                  err,
                });
              }
            }

            // Only fire for OAuth signups. The endpoint path (`/callback/:id`)
            // is propagated to the async-context — email/pwd signups go via
            // `/sign-up/email` and are not concerned by `runOnActivation`
            // (they go through the existing Feathers `sendVerificationEmailOnCreate`
            // hook → email verify → `onEmailVerified`).
            if (typeof path !== 'string' || !path.startsWith('/callback/')) return;
            if (typeof onAfterOAuthSignUp !== 'function') return;
            try {
              await onAfterOAuthSignUp(createdUser, context?.request);
            } catch (err) {
              context?.logger?.error?.('onAfterOAuthSignUp failed', {
                userId: createdUser?.id,
                err,
              });
            }
          },
        },
      },
    },
  };

  const instance = betterAuth(baOptions);

  const {
    upsertCredentialAccount,
    updateCredentialPassword,
    adminSetPassword,
    deleteCredentialAccount,
    deleteOAuthAccount,
    deleteAllOAuthAccounts,
    revokeUserSessions,
    revokeUserGrants,
    refreshUserSessions,
    verifyCredentialPassword,
    getAccountTypesByUserId,
  } = createCredentialHelpers(instance);

  // Instance-bound api-key façades (verify / create / list / revoke). list and
  // revoke go through the adapter, not the plugin's session-gated endpoints, so
  // they serve agenda owners and server-side admin too (see ./apiKey.js).
  const {
    verifyKey,
    createUserKey,
    createAgendaKey,
    listUserKeys,
    listAgendaKeys,
    revokeUserKey,
    revokeAgendaKey,
    renameUserKey,
    renameAgendaKey,
  } = createApiKeyHelpers(instance);

  // In-process verifier for OA-issued OAuth access tokens (the API acting as a
  // resource server for its own AS — the delegation path). Scoped to the API
  // audiences (NOT the full `validAudiences` the AS issues for — see above): an
  // SSO/OIDC token bound to the AS origin must not double as an API credential.
  const { verifyOAuthAccessToken } = createOAuthTokenHelpers(instance, {
    validAudiences: apiAudiences,
  });

  // Late-bind the token-exchange subject verifier (declared above the plugins
  // array). The SUBJECT token is a gateway's own grant, so this verifier trusts
  // the union of every registered `subjectResource` — a SEPARATE, wider set than
  // the API verifier above (which trusts only `aud=api`). The endpoint then
  // tightens further per call: a client may only exchange a token bound to ITS
  // OWN `subjectResource`. Both verifiers share signature/issuer/expiry/uid checks.
  if (exchangePlugin) {
    verifyExchangeSubject = createOAuthTokenHelpers(instance, {
      validAudiences: subjectResources,
    }).verifyOAuthAccessToken;
    // Re-check, at exchange time, that the consenting user is still allowed to
    // obtain API access (not removed/blacklisted). The exchange runs once per
    // gateway call (per MCP `execute`), so this gates the data path without a
    // per-API-request lookup; the subject `aud=mcp` token stays locally verifiable
    // but is no longer exchangeable for an `aud=api` token. Keyed on the OA `uid`
    // the verifier extracts. Late-bound like the verifier above.
    checkExchangeSubjectActive = async (uid) =>
      isUserActiveByUid((await instance.$context).adapter, uid);
  }

  async function getSessionFromRequest(
    req,
    prevResponse,
    { disableCookieCache } = {},
  ) {
    return instance.api.getSession({
      headers: toHeaders(req, prevResponse),
      // When set, bypass BA's signed cookie cache (1h maxAge) and force a
      // fresh session lookup. The cibul-node load middleware relies on this so
      // `isBlacklisted` and session revocation are seen on the next request
      // rather than up to an hour later.
      ...disableCookieCache ? { query: { disableCookieCache: true } } : {},
    });
  }

  // Low-level primitive: open a BA session for an arbitrary user and emit
  // the corresponding signed `session_token` cookie on `res`. Delegates to
  // the `oaImpersonationPlugin` `openSession` endpoint, which calls BA's own
  // `setSessionCookie` (dist/cookies/index.mjs:122-135) — i.e. canonical
  // signing scheme + canonical attribute set + cookie-cache handling, with
  // zero homemade serialisation.
  //
  // Invoked in-process (`asResponse: true`) — bypasses Express, the
  // origin-check middleware, the public router, and the rate limiter. The
  // matching HTTP path (`/api/auth/oa/open-session`) is denied by an
  // Express middleware mounted before `auth.nodeHandler` (see
  // server.js / test/helpers/buildApp.js).
  async function openSession({ userId, req: _req, res }) {
    if (!res) throw new Error('openSession: res is required');
    if (userId === undefined || userId === null) {
      throw new Error('openSession: userId is required');
    }
    const baResponse = await instance.api.openSession({
      body: { userId: String(userId) },
      asResponse: true,
    });
    forwardSetCookieHeaders(baResponse, res);
    if (!baResponse.ok) {
      const body = await baResponse
        .clone()
        .json()
        .catch(() => ({}));
      throw new Error(
        body?.message || `openSession failed (${baResponse.status})`,
      );
    }
  }

  // Superadmin "sign as" — delegates entirely to BA's signed-cookie pattern.
  // The plugin endpoint:
  //   1. resolves the impersonator's session via `getSessionFromCtx`;
  //   2. opens a BA session for the target user (with `impersonatedBy`
  //      stamped on the session row so /signout can detect the state);
  //   3. stashes the impersonator's session token in the BA-signed
  //      `oa.admin_session` cookie;
  //   4. swaps the `oa.session_token` cookie to the impersonated user.
  // Authorization is the consumer's responsibility — cibul-node gates this
  // via the `allowSuperAdmin` Express middleware before calling
  // `auth.impersonateUser`.
  async function impersonateUser({ targetUserId, req, res }) {
    if (!res) throw new Error('impersonateUser: res is required');
    if (targetUserId === undefined || targetUserId === null) {
      throw new Error('impersonateUser: targetUserId is required');
    }
    const baResponse = await instance.api.impersonateUser({
      body: { userId: String(targetUserId) },
      headers: toHeaders(req),
      asResponse: true,
    });
    forwardSetCookieHeaders(baResponse, res);
    if (!baResponse.ok) {
      const body = await baResponse
        .clone()
        .json()
        .catch(() => ({}));
      throw new Error(
        body?.message || `impersonateUser failed (${baResponse.status})`,
      );
    }
  }

  // Restore the impersonator's session and drop the impersonated one. Reads
  // the signed `oa.admin_session` cookie (written by `impersonateUser`),
  // validates the corresponding BA session, deletes the impersonated session,
  // re-emits the impersonator's session_token, and clears the marker.
  async function stopImpersonating({ req, res }) {
    if (!res) throw new Error('stopImpersonating: res is required');
    const baResponse = await instance.api.stopImpersonating({
      headers: toHeaders(req),
      asResponse: true,
    });
    forwardSetCookieHeaders(baResponse, res);
    if (!baResponse.ok) {
      const body = await baResponse
        .clone()
        .json()
        .catch(() => ({}));
      throw new Error(
        body?.message || `stopImpersonating failed (${baResponse.status})`,
      );
    }
  }

  // Periodic GC of expired sessions / OAuth tokens and never-approved DCR
  // clients. The logic lives in ./gcExpired.js (pure over the adapter, unit
  // tested); here we just feed it the in-process adapter and the trusted-client
  // allowlist. The caller schedules it (cibul-node task.js).
  function gcExpired(opts) {
    return instance.$context.then(({ adapter }) =>
      gcExpiredRows(adapter, { trustedClients, ...opts }));
  }

  return {
    instance,
    // Express-compatible handler — mount with `app.all('/api/auth/*', auth.nodeHandler)`.
    nodeHandler: toNodeHandler(instance),
    api: instance.api,
    // OA api-key façades. `verifyKey(key)` -> normalized owner descriptor
    // ({ owner, oaKind, referenceId, permissions, record }) or null; owner
    // *loading* stays the caller's job. create* return `{ key, record }` with
    // the plaintext exposed once. `hashApiKey` is the pure static hasher, also a
    // package-root named export (see ./apiKey.js).
    verifyKey,
    createUserKey,
    createAgendaKey,
    listUserKeys,
    listAgendaKeys,
    revokeUserKey,
    revokeAgendaKey,
    renameUserKey,
    renameAgendaKey,
    hashApiKey,
    // Verify an OA-issued OAuth JWS access token in-process → normalized
    // descriptor ({ userUid, scopes, clientId, audiences }) or null. Owner
    // *loading* (and the blacklist check) stay the caller's job, exactly like
    // `verifyKey`. The v3 API uses this for the delegated MCP path.
    verifyOAuthAccessToken,
    // Periodic maintenance: purge expired sessions / OAuth tokens and
    // never-approved DCR clients. The caller schedules it (cibul-node task.js).
    gcExpired,
    // Mirror legacy OA password writes into `account.password` (phase 2a).
    encodeLegacyPassword: encodeLegacy,
    upsertCredentialAccount,
    updateCredentialPassword,
    // Superadmin-driven password reset (no `currentPassword` challenge).
    // Hashes the plaintext with argon2id and upserts the credential row.
    // Authorization is the consumer's responsibility; gate behind the
    // existing superAdmin middleware when wiring an HTTP endpoint.
    adminSetPassword,
    deleteCredentialAccount,
    // Verifies a plaintext password against `account.password` (argon2id +
    // legacy sentinel formats) — same routine BA's `/sign-in/email` uses.
    // Use from password-challenge endpoints (delete agenda, change email,
    // delete account) so they don't read the stale legacy `user.password`
    // column which is `NULL` for users created via better-auth.
    verifyCredentialPassword,
    // OAuth account row helpers (phase 4).
    deleteOAuthAccount,
    deleteAllOAuthAccounts,
    revokeUserSessions,
    // Revoke a user's OAuth grants (consents + refresh/access tokens) on
    // ban/remove, so they mint no new tokens; the token-exchange re-check cuts
    // the data path before any already-issued JWS access token lapses.
    revokeUserGrants,
    // Re-snapshot the user into active Redis sessions after an out-of-band
    // Feathers patch of a session-mirrored field (full_name, image, culture,
    // transverse_api_access, is_new), without logging the user out — the
    // BA-aware replacement for the old `@openagenda/sessions` `sessions.refresh`.
    refreshUserSessions,
    // Source of truth for `hasLocalAccount` / `hasSocialAccount`. Reads the
    // BA `account` table — the legacy `user.{password, facebook_uid, ...}`
    // columns are stale for BA-only users.
    getAccountTypesByUserId,
    // Helpers exposed for Express integration (phase 3).
    toHeaders,
    forwardSetCookieHeaders,
    getSessionFromRequest,
    // Session-opening primitives.
    openSession,
    impersonateUser,
    stopImpersonating,
  };
}

export { fromNodeHeaders, hashApiKey };
