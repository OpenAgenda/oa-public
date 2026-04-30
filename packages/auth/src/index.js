import { betterAuth } from 'better-auth';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { redisStorage } from '@better-auth/redis-storage';
import { MysqlDialect } from 'kysely';
import generateUid from './generateUid.js';
import createCredentialHelpers from './internalAccount.js';
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
    onEmailVerified,
  } = options;

  if (!mysqlPool) {
    throw new Error('@openagenda/auth: mysqlPool is required');
  }

  const tables = {
    user: schemas.user ?? 'user',
    account: schemas.account ?? 'account',
    verification: schemas.verification ?? 'verification',
  };

  const instance = betterAuth({
    database: { dialect: new MysqlDialect({ pool: mysqlPool }), type: 'mysql' },
    secret,
    baseURL,
    trustedOrigins,
    advanced: {
      cookiePrefix: 'oa',
      database: {
        generateId: 'serial',
      },
    },
    emailAndPassword: {
      enabled: true,
      // Custom argon2id hash for new credentials, multi-format verify that
      // also accepts the legacy sentinel formats written by phase 2a + the
      // backfill migration. New writes go to argon2id; existing legacy rows
      // stay readable until the lazy-rehash hook below rotates them.
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
    },
    hooks: {
      // Block sign-in for soft-removed or blacklisted users. Phase 2.5 deletes
      // the credential row on remove (so removed users fail naturally) and
      // revokes sessions on blacklist (but keeps the row, since blacklist is
      // reversible). Without this guard, a blacklisted user could re-signin.
      // TODO(phase 4): when OAuth lands, also enforce this on the OAuth
      // callback (`/callback/:provider`) — `/sign-in/social` only triggers
      // a redirect, the user is loaded/linked on the callback.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/email') return;
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
      }),
      // Lazy-rehash: on a successful sign-in, if the stored hash is one of
      // the legacy sentinel formats, rewrite it to argon2id. Errors are
      // swallowed — the user is already signed in, the rehash will retry on
      // the next sign-in, and the backfill migration is the source of truth.
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/email') return;
        const { newSession } = ctx.context;
        if (!newSession) return;
        const userId = newSession.user.id;
        try {
          const accounts = await ctx.context.internalAdapter.findAccountByUserId(userId);
          const credential = accounts.find(
            (a) => a.providerId === 'credential',
          );
          if (!credential?.password || !isLegacy(credential.password)) return;
          // internalAdapter.updatePassword writes the value directly; we must
          // hash here. ctx.context.password.hash mirrors our custom hash.
          const newHash = await ctx.context.password.hash(ctx.body.password);
          await ctx.context.internalAdapter.updatePassword(userId, newHash);
        } catch (err) {
          ctx.context.logger?.error?.('lazy rehash failed', { userId, err });
        }
      }),
    },
    session: {
      // Sessions live in Redis (secondaryStorage). storeSessionInDatabase
      // defaults to false when secondaryStorage is provided — no DB writes.
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    emailVerification: {
      afterEmailVerification: async (user, request) => {
        if (typeof onEmailVerified === 'function') {
          await onEmailVerified(user, request);
        }
      },
    },
    account: {
      modelName: tables.account,
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
          returned: false,
          defaultValue: false,
        },
      },
    },
  });

  const {
    upsertCredentialAccount,
    updateCredentialPassword,
    deleteCredentialAccount,
    revokeUserSessions,
  } = createCredentialHelpers(instance);

  async function getSessionFromRequest(req) {
    return instance.api.getSession({ headers: toHeaders(req) });
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
    deleteCredentialAccount,
    revokeUserSessions,
    // Helpers exposed for Express integration (phase 3).
    toHeaders,
    forwardSetCookieHeaders,
    getSessionFromRequest,
  };
}

export { toNodeHandler, fromNodeHeaders };
