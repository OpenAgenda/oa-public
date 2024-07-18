import _ from 'lodash';
import { hooks, registerContextUpdater, withProps } from '@feathersjs/hooks';

import logs from '@openagenda/logs';
import Users from '@openagenda/users';
import beforeCreate from './lib/beforeCreate.mjs';
import onRemove from './lib/onRemove.mjs';
import onCreate from './lib/onCreate.mjs';
import onUpdate from './lib/onUpdate.mjs';
import onPatch from './lib/onPatch.mjs';
import onGenerateApiKey from './lib/onGenerateApiKey.mjs';
import onActivation from './lib/onActivation.mjs';
import sendToken from './lib/sendToken.mjs';
import replaceIdMe from './lib/replaceIdMe.mjs';
import loadBySessionOrKey from './middleware/loadBySessionOrKey.mjs';
import requireSuperAdmin from './middleware/requireSuperAdmin.mjs';
import verifyTransverseApiAccess from './middleware/verifyTransverseApiAccess.mjs';
import verifyHeadersPassword from './middleware/verifyHeadersPassword.mjs';
import svcHooks from './hooks/index.mjs';
import notifyAndRemove from './tasks/notifyAndRemove.mjs';
import anonymizeDeletedUser from './tasks/anonymizeDeletedUser.mjs';
import plugApp from './plugApp.mjs';

const log = logs('services/users');

export async function init(config, services) {
  const {
    agendas,
    keys,
    queues,
  } = services;

  const queue = queues('users');

  queue.register({
    anonymizeDeletedUser: anonymizeDeletedUser(services),
  });

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
      'user', 'apiKeySet', 'unsubscribed', 'key', 'userToken',
    ]),
    imagePath: config.aws.imageBucketPath,
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
        get: identifiers => keys(identifiers).get({ optionalKey: !('key' in identifiers) }),
        create: (identifiers, data) => keys(identifiers).create(data),
        remove: identifiers => keys(identifiers).remove(),
      },
    },
    logger: config.getLogConfig('svc', 'users', false),
    superAdminUids: config.superAdminUids,
  });

  registerContextUpdater(service, withProps({ services }));

  hooks(service, [
    replaceIdMe(),
  ]);
  hooks(service, svcHooks);

  service.mw = {
    loadBySessionOrKey,
    requireSuperAdmin,
    verifyTransverseApiAccess,
    verifyHeadersPassword,
  };

  services.tokens = tokensService;

  service.tasks = {
    processQueue: () => {
      log('processQueue task');
      queue.run();
    },
    notifyAndRemove: notifyAndRemove(services),
  };

  service.plugApp = plugApp;

  return service;
}
