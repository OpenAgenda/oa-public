import { betterAuth } from 'better-auth';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { getCurrentAuthContext } from '@better-auth/core/context';
import { redisStorage } from '@better-auth/redis-storage';
import { apiKey } from '@better-auth/api-key';
import { MysqlDialect } from 'kysely';
import generateUid from './generateUid.js';
import createCredentialHelpers from './internalAccount.js';
import oaImpersonationPlugin from './impersonationPlugin.js';
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
    schemas = {},
    google,
    facebook,
    onEmailVerified,
    onSendVerificationEmail,
    onSendPasswordResetEmail,
    onAfterOAuthSignUp,
    // Extension callbacks. All optional, all no-op when absent so consumers
    // adopt them progressively. The contract (request shape, semantics)
    // lives in the wiring sites below.
    onSignInSuccess,
    onSignUpComplete,
    validateSignUp,
  } = options;

  if (!mysqlPool) {
    throw new Error('@openagenda/auth: mysqlPool is required');
  }

  const tables = {
    user: schemas.user ?? 'user',
    account: schemas.account ?? 'account',
    verification: schemas.verification ?? 'verification',
    apiKey: schemas.apiKey ?? 'apikey',
  };

  // Map the api-key plugin's camelCase schema to OA's snake_case columns
  // (same convention as the account/verification tables above). The model key
  // stays `apikey` (the plugin's internal name); only the physical table and
  // column names are remapped.
  const apiKeyPlugin = apiKey({
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

  const baOptions = {
    database: { dialect: new MysqlDialect({ pool: mysqlPool }), type: 'mysql' },
    secret,
    baseURL,
    trustedOrigins,
    // `apiKeyPlugin` runs with enableSessionForAPIKeys=false (default): it adds
    // the api-key endpoints + `apikey` table but does NOT intercept requests or
    // open sessions from an x-api-key header. The v3 API resolves keys itself
    // via auth.api.verifyApiKey, keeping full control of the error envelope.
    plugins: [oaImpersonationPlugin(), apiKeyPlugin],
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
          // Returning `{}` means no user-field overrides.
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
            return {};
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
          if (user && (user.isRemoved || user.isBlacklisted)) {
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

          if (user.isRemoved || user.isBlacklisted) {
            try {
              await ctx.context.internalAdapter.deleteSessions(String(userId));
            } catch (err) {
              ctx.context.logger?.error?.(
                'oauth callback deleteSessions failed',
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
      }),
    },
    session: {
      // Sessions live in Redis (secondaryStorage). storeSessionInDatabase
      // defaults to false when secondaryStorage is provided — no DB writes.
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
    refreshUserSessions,
    verifyCredentialPassword,
    getAccountTypesByUserId,
  } = createCredentialHelpers(instance);

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

  return {
    instance,
    // Express-compatible handler — mount with `app.all('/api/auth/*', auth.nodeHandler)`.
    nodeHandler: toNodeHandler(instance),
    api: instance.api,
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

export { toNodeHandler, fromNodeHeaders };
