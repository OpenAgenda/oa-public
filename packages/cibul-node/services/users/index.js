import _ from 'lodash';
import { hooks, registerContextUpdater, withProps } from '@feathersjs/hooks';

import logs from '@openagenda/logs';
import Users from '@openagenda/users';
import beforeCreate from './lib/beforeCreate.js';
import onRemove from './lib/onRemove.js';
import onCreate from './lib/onCreate.js';
import onActivation from './lib/onActivation.js';
import sendToken from './lib/sendToken.js';
import replaceIdMe from './lib/replaceIdMe.js';
import loadBySessionOrKey from './middleware/loadBySessionOrKey.js';
import allowSuperAdmin from './middleware/allowSuperAdmin.js';
import verifyTransverseApiAccess from './middleware/verifyTransverseApiAccess.js';
import verifyHeadersPassword from './middleware/verifyHeadersPassword.js';
import svcHooks from './hooks/index.js';
import dualWriteLegacyPasswordHooks from './hooks/dualWriteLegacyPassword.js';
import accountCleanupHooks from './hooks/accountCleanup.js';
import sendVerificationEmailOnCreateHooks from './hooks/sendVerificationEmailOnCreate.js';
import notifyAndRemove from './tasks/notifyAndRemove.js';
import anonymizeDeletedUser from './tasks/anonymizeDeletedUser.js';
import plugApp from './plugApp.js';

const log = logs('services/users');

export async function init(config, services) {
  const { agendas, bull } = services;

  const queue = new bull.Queue('users', { prefix: '{users}' });

  const worker = new bull.Worker(
    queue.name,
    (job) => {
      switch (job.name) {
        case 'anonymizeDeletedUser':
          return anonymizeDeletedUser(services, job.data);
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  worker.on('error', (failedReason) => log.error('error', failedReason));

  const tokensService = new Users.Tokens({
    Model: config.knex,
    name: config.schemas.userToken,
    id: 'id',
    paginate: {
      default: 20,
      max: 100,
    },
    interfaces: {
      sendToken: sendToken.bind(null, config, services),
    },
  });

  const service = new Users({
    Model: config.knex,
    name: config.schemas.user,
    paginate: {
      default: 20,
      max: 100,
    },
    multi: true,
    schemas: _.pick(config.schemas, [
      // explicit list schemas used by service
      'user',
      'apiKeySet',
      'unsubscribed',
      'userToken',
    ]),
    imagePath: config.s3.mainBucketPath,
    Files: services.files,
    services,
    getTokensService: () => tokensService,
    interfaces: {
      onRemove: onRemove.bind(null, { queue }),
      beforeCreate: beforeCreate.bind(null, config, services),
      onCreate: onCreate.bind(null, config, services),
      onActivation,
      sendToken: sendToken.bind(null, config, services),
      getAgenda: (agendaUid, cb) => agendas.get({ uid: agendaUid }, cb),
      // Fallback used by `Users.verifyPassword` when the legacy
      // `user.password` column is empty (BA-only users — signup/reset via
      // better-auth never writes the legacy hash). Verifies against
      // `account.password` through the same routine BA's `/sign-in/email`
      // uses (argon2id + legacy sentinel formats).
      verifyPassword: services.auth
        ? (user, password) =>
          services.auth.verifyCredentialPassword(user.id, password)
        : undefined,
      // Read from the BA `account` table when present. `populateAccountTypes`
      // calls this with a single user id (the only multi-user callsite is an
      // admin members list, where the helper fans out internally). Returns a
      // `Map<userId, Set<providerId>>`; the hook converts it to the public
      // `{hasLocalAccount, hasSocialAccount}` shape.
      getAccountTypes: services.auth
        ? (userIds) => services.auth.getAccountTypesByUserId(userIds)
        : undefined,
    },
    logger: config.getLogConfig('svc', 'users', false),
    superAdminUids: config.superAdminUids,
  });

  registerContextUpdater(service, withProps({ services }));

  hooks(service, [replaceIdMe()]);
  hooks(service, svcHooks);
  if (services.auth) {
    hooks(service, dualWriteLegacyPasswordHooks());
    hooks(service, accountCleanupHooks());
    hooks(service, sendVerificationEmailOnCreateHooks());
  }

  service.mw = {
    loadBySessionOrKey,
    allowSuperAdmin,
    verifyTransverseApiAccess,
    verifyHeadersPassword,
  };

  services.tokens = tokensService;

  service.tasks = {
    processQueue: () => {
      log('processQueue task');
      worker.run();
    },
    notifyAndRemove: notifyAndRemove(services),
  };

  service.plugApp = plugApp;

  service.shutdown = async (options = {}) => {
    if (options.clear) {
      await queue.drain();
    }
    await worker.close();
  };

  return service;
}
