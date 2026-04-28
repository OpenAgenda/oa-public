import mysql from 'mysql2';
import Auth from '@openagenda/auth';

export async function init(config, services) {
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
  });

  return Object.assign(auth, {
    shutdown: async () => {
      await new Promise((resolve, reject) => {
        mysqlPool.end((err) => (err ? reject(err) : resolve()));
      });
    },
  });
}
