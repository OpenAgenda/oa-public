import _ from 'lodash';
import { hooks, registerContextUpdater, withProps } from '@feathersjs/hooks';

import logs from '@openagenda/logs';
import Users from '@openagenda/users';
import beforeCreate from './lib/beforeCreate.js';
import onRemove from './lib/onRemove.js';
import onCreate from './lib/onCreate.js';
import onUpdate from './lib/onUpdate.js';
import onPatch from './lib/onPatch.js';
import onGenerateApiKey from './lib/onGenerateApiKey.js';
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
import notifyAndRemove from './tasks/notifyAndRemove.js';
import anonymizeDeletedUser from './tasks/anonymizeDeletedUser.js';
import plugApp from './plugApp.js';

const log = logs('services/users');

export async function init(config, services) {
  const { agendas, keys, bull } = services;

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
      'key',
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
      onUpdate: onUpdate.bind(null, config, services),
      onPatch: onPatch.bind(null, config, services),
      onGenerateApiKey: onGenerateApiKey.bind(null, config),
      onActivation,
      sendToken: sendToken.bind(null, config, services),
      getAgenda: (agendaUid, cb) => agendas.get({ uid: agendaUid }, cb),
      keys: {
        get: (identifiers) =>
          keys(identifiers).get({ optionalKey: !('key' in identifiers) }),
        create: (identifiers, data) => keys(identifiers).create(data),
        remove: (identifiers) => keys(identifiers).remove(),
      },
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
