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
    google: config.auth?.google?.id ? config.auth.google : undefined,
    facebook: config.auth?.facebook?.id ? config.auth.facebook : undefined,
    onAfterOAuthSignUp: async (user) => {
      try {
        const oaUser = await services.users.findOne({
          query: { id: user.id },
          detailed: true,
        });
        if (!oaUser) return;
        await runOnActivation(services, oaUser);
        services.users
          .refresh(oaUser.uid, { lastSignin: true })
          .catch((err) => log('warn', 'lastSignin refresh failed', { err }));
      } catch (err) {
        log('error', 'onAfterOAuthSignUp failed', { userId: user?.id, err });
      }
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
    onSendVerificationEmail: async ({ user, url }) => {
      try {
        await services.mails.send({
          template: 'activateAccount',
          to: user.email,
          lang: user.culture,
          data: {
            activateLink: url,
            emailSettingsLink: null,
          },
          queue: false,
        });
      } catch (err) {
        log('error', 'sendVerificationEmail failed', { userId: user?.id, err });
      }
    },
    onSendPasswordResetEmail: async ({ user, url }) => {
      try {
        await services.mails.send({
          template: 'resetPassword',
          to: user.email,
          lang: user.culture,
          data: {
            resetLink: url,
            emailSettingsLink: null,
          },
          queue: false,
        });
      } catch (err) {
        log('error', 'sendPasswordResetEmail failed', {
          userId: user?.id,
          err,
        });
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
