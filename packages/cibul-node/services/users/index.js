'use strict';

const _ = require('lodash');
const { hooks, registerContextUpdater, withProps } = require('@feathersjs/hooks');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const errors = require('@feathersjs/errors');
const Users = require('@openagenda/users');
const keys = require('@openagenda/keys');
const agendas = require('@openagenda/agendas');
const sessions = require('@openagenda/sessions');
const beforeCreate = require('./beforeCreate');
const beforeRemove = require('./beforeRemove');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const onPatch = require('./onPatch');
const onGenerateApiKey = require('./onGenerateApiKey');
const onActivation = require('./onActivation');
const sendToken = require('./sendToken');
const resyncSession = require('./middleware/resyncSession');
const sendChangeEmail = require('./middleware/sendChangeEmail');
const setFlashChangeEmail = require('./middleware/setFlashChangeEmail');
const setFlashAccountRemoved = require('./middleware/setFlashAccountRemoved');
const loadBySessionOrKey = require('./middleware/loadBySessionOrKey');
const verifySuperAdmin = require('./middleware/verifySuperAdmin');
const getHandler = require('./getHandler');
const svcHooks = require('./hooks');
const notifyAndRemove = require('./tasks/notifyAndRemove');

function replaceIdMe() {
  return async (context, next) => {
    if (context.id !== 'me') {
      return next();
    }

    if (!context.params.user || !context.params.user.uid) {
      throw new errors.NotAuthenticated('You should be logged');
    }

    context.id = context.params.user.uid;

    await next();
  };
}

function plugApp(app) {
  const cmn = require('../../lib/commons-app'); // avoid circular reference
  const service = app.services.users;

  express(feathers(), app); // extend app with .configure, .service and .use
  app.configure(express.rest(null)); // add handler for requests

  app.use(
    '/users',
    (req, res, next) => {
      const isAuthenticated = !!req.user;
      req.feathers.user = req.user;
      req.authenticated = isAuthenticated;
      req.feathers.authenticated = isAuthenticated;

      next();
    },
  );

  app.use('/users/me', service.upload.middleware([{ name: 'image', unique: true }]));

  app.get('/users', getHandler('find', ['params'])(service));
  app.get('/users/:__feathersId', getHandler('get', ['id', 'params'])(service));
  app.post('/users', getHandler('create', ['data', 'params'])(service));
  app.patch('/users/:__feathersId', getHandler('patch', ['id', 'data', 'params'])(service));
  app.patch('/users', getHandler('patch', ['id', 'data', 'params'])(service));
  app.put('/users/:__feathersId', getHandler('update', ['id', 'data', 'params'])(service));
  app.put('/users', getHandler('update', ['id', 'data', 'params'])(service));
  app.delete('/users/:__feathersId', getHandler('remove', ['id', 'params'])(service));
  app.delete('/users', getHandler('remove', ['id', 'params'])(service));

  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    getHandler('requestChangeEmail', ['id', 'data', 'params'])(service),
  );
  app.get('/users/:__feathersId/confirmChangeEmail', getHandler('confirmChangeEmail', ['id', 'params'])(service));
  app.patch('/users/:__feathersId/changePassword', getHandler('changePassword', ['id', 'data', 'params'])(service));
  app.get('/users/:__feathersId/generateApiKey', getHandler('generateApiKey', ['id', 'params'])(service));
  app.patch('/users/:__feathersId/setNewFlag', getHandler('setNewFlag', ['id', 'data', 'params'])(service));
  app.patch('/users/:__feathersId/refresh', getHandler('refresh', ['id', 'data', 'params'])(service));

  // update session after a user patch
  app.patch(
    '/users/:__feathersId',
    sessions.mw.open('user', 'sessionResult'),
    resyncSession(),
  );

  // send confirmation email after requestChangeEmail
  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    sendChangeEmail(service),
  );

  // set flash message after confirm change of email
  app.get(
    '/users/:__feathersId/confirmChangeEmail',
    setFlashChangeEmail(),
  );

  // set flash & redirect message after account deletion
  app.delete(
    '/users/:__feathersId',
    setFlashAccountRemoved(),
  );

  app.use('/users', express.errorHandler({
    html: (err, req, res) => cmn.catchError(req, res)(err),
    logger: null,
  }));
}

async function init(config, services) {
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
      beforeRemove,
      beforeCreate: beforeCreate.bind(null, config, services),
      onCreate: onCreate.bind(null, config, services),
      onUpdate: onUpdate.bind(null, config, services),
      onPatch: onPatch.bind(null, config, services),
      onGenerateApiKey,
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
    notifyAndRemove: notifyAndRemove(services),
  };

  return service;
}

module.exports = {
  init,
  plugApp,
};
