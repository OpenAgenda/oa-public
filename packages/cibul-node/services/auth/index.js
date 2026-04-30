import mysql from 'mysql2';
import logs from '@openagenda/logs';
import Auth from '@openagenda/auth';
import runOnActivation from '../users/lib/runOnActivation.js';

const log = logs('services/auth');

export async function init(config, services) {
  const { schemas } = config;

  const mysqlPool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const auth = Auth({
    mysqlPool,
    redis: services.redis,
    secret: config.auth.secret,
    baseURL: config.root,
    trustedOrigins: [config.root, ...config.auth?.trustedOrigins ?? []],
    schemas: {
      user: schemas.user,
      account: schemas.account,
      verification: schemas.verification,
    },
    onEmailVerified: async (user) => {
      try {
        const oaUser = await services.users.findOne({
          query: { id: user.id },
          detailed: true,
        });
        if (!oaUser) return;
        await runOnActivation(services, oaUser);
      } catch (err) {
        log('error', 'onEmailVerified failed', { userId: user?.id, err });
      }
    },
  });

  return Object.assign(auth, {
    shutdown: async () => {
      await new Promise((resolve, reject) => {
        mysqlPool.end((err) => (err ? reject(err) : resolve()));
      });
    },
  });
}
