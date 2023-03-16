'use strict';

const _ = require('lodash');
const { hooks, registerContextUpdater, withProps } = require('@feathersjs/hooks');

const log = require('@openagenda/logs')('services/users');
const Users = require('@openagenda/users');

const beforeCreate = require('./lib/beforeCreate');
const onRemove = require('./lib/onRemove');
const onCreate = require('./lib/onCreate');
const onUpdate = require('./lib/onUpdate');
const onPatch = require('./lib/onPatch');
const onGenerateApiKey = require('./lib/onGenerateApiKey');
const onActivation = require('./lib/onActivation');
const sendToken = require('./lib/sendToken');
const replaceIdMe = require('./lib/replaceIdMe');
const loadBySessionOrKey = require('./middleware/loadBySessionOrKey');
const verifySuperAdmin = require('./middleware/verifySuperAdmin');

const svcHooks = require('./hooks');
const notifyAndRemove = require('./tasks/notifyAndRemove');
const anonymizeDeletedUser = require('./tasks/anonymizeDeletedUser');

const plugApp = require('./plugApp');

async function init(config, services) {
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
      sendToken: sendToken.bind(null, config),
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
      sendToken: sendToken.bind(null, config),
      getAgenda: (agendaUid, cb) => agendas.get({ uid: agendaUid }, cb),
      keys: {
        get: identifiers => keys(identifiers).get({ optionalKey: !('key' in identifiers) }),
        create: (identifiers, data) => keys(identifiers).create(data),
        remove: identifiers => keys(identifiers).remove(),
      },
    },
    logger: config.getLogConfig('svc', 'users', false),
  });

  registerContextUpdater(service, withProps({ services }));

  hooks(service, [
    replaceIdMe(),
  ]);
  hooks(service, svcHooks);

  service.mw = {
    loadBySessionOrKey,
    verifySuperAdmin: verifySuperAdmin(config.superAdminIds),
  };

  services.tokens = tokensService;

  service.tasks = {
    processQueue: () => {
      log('processQueue task');
      queue.run();
    },
    notifyAndRemove: notifyAndRemove(services),
  };

  return service;
}

module.exports = {
  init,
  plugApp,
};
