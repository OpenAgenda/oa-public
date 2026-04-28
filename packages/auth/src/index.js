import { betterAuth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import { redisStorage } from '@better-auth/redis-storage';
import { MysqlDialect } from 'kysely';
import generateUid from './generateUid.js';

export default function Auth(options = {}) {
  const { mysqlPool, redis, trustedOrigins, secret, baseURL } = options;

  if (!mysqlPool) {
    throw new Error('@openagenda/auth: mysqlPool is required');
  }

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
    },
    session: {
      // Sessions live in Redis (secondaryStorage). storeSessionInDatabase
      // defaults to false when secondaryStorage is provided — no DB writes.
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 300,
      },
    },
    account: {
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
      },
    },
  });

  return {
    instance,
    // Express-compatible handler — mount with `app.all('/api/auth/*', auth.nodeHandler)`.
    nodeHandler: toNodeHandler(instance),
    api: instance.api,
  };
}
