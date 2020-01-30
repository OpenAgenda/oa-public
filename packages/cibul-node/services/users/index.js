"use strict";

const _ = require('lodash');
const { hooks } = require('@openagenda/hooks');
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
const onGenerateApiKey = require('./onGenerateApiKey');
const onActivation = require('./onActivation');
const sendToken = require('./sendToken');
const setImageProfile = require('./middleware/setImageProfile');
const resyncSession = require('./middleware/resyncSession');
const sendChangeEmail = require('./middleware/sendChangeEmail');
const setFlashChangeEmail = require('./middleware/setFlashChangeEmail');
const setFlashAccountRemoved = require('./middleware/setFlashAccountRemoved');
const getHandler = require('./getHandler');
const svcHooks = require('./hooks.js');

function walkProtoChain(obj, walker = Object.getOwnPropertyNames) {
  const proto = Object.getPrototypeOf(obj);
  const inherited = proto !== Object.prototype ? walkProtoChain(proto, walker) : [];

  return [...new Set(walker(obj).concat(inherited))];
}

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
};

module.exports = {
  init,
  plugApp
};

function plugApp(app) {
  const cmn = require('../../lib/commons-app'); // avoid circular reference
  const service = module.exports; // or this

  express(feathers(), app); // extend app with .configure, .service and .use
  app.configure(express.rest(null)); // add handler for requests

  app.use(
    '/users',
    (req, res, next) => {
      req.feathers.user = req.user;
      req.feathers.authenticated = req.authenticated = !!req.user;

      next();
    }
  );

  app.post(
    '/users/:__feathersId/setImageProfile',
    setImageProfile(service)
  );

  app.get('/users', getHandler('find', ['params'])(service));
  app.get('/users/:__feathersId', getHandler('get', ['id', 'params'])(service));
  app.post('/users', getHandler('create', ['data', 'params'])(service));
  app.patch('/users/:__feathersId', getHandler('patch', ['id', 'data', 'params'])(service));
  app.patch('/users', getHandler('patch', ['id', 'data', 'params'])(service));
  app.put('/users/:__feathersId', getHandler('update', ['id', 'data', 'params'])(service));
  app.put('/users', getHandler('update', ['id', 'data', 'params'])(service));
  app.delete('/users/:__feathersId', getHandler('remove', ['id', 'params'])(service));
  app.delete('/users', getHandler('remove', ['id', 'params'])(service));

  app.post('/users/setImageProfile', getHandler('setImageProfile', ['id', 'data', 'params'])(service));
  app.post('/users/clearImageProfile', getHandler('clearImageProfile', ['id', 'params'])(service));
  app.patch('/users/requestChangeEmail', getHandler('requestChangeEmail', ['id', 'data', 'params'])(service));
  app.get('/users/confirmChangeEmail', getHandler('confirmChangeEmail', ['id', 'params'])(service));
  app.patch('/users/changePassword', getHandler('changePassword', ['id', 'data', 'params'])(service));
  app.get('/users/generateApiKey', getHandler('generateApiKey', ['id', 'params'])(service));
  app.patch('/users/setNewFlag', getHandler('setNewFlag', ['id', 'data', 'params'])(service));
  app.patch('/users/refresh', getHandler('refresh', ['id', 'data', 'params'])(service));

  // update session after a user patch
  app.patch(
    '/users/:__feathersId',
    sessions.middleware.open('user', 'sessionResult'),
    resyncSession()
  );

  // send confirmation email after requestChangeEmail
  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    sendChangeEmail(service)
  );

  // set flash message after confirm change of email
  app.get(
    '/users/:__feathersId/confirmChangeEmail',
    setFlashChangeEmail()
  );

  // set flash & redirect message after account deletion
  app.delete(
    '/users/:__feathersId',
    setFlashAccountRemoved()
  );

  app.use('/users', express.errorHandler({
    html: (err, req, res) => cmn.catchError(req, res)(err),
    logger: null
  }));
}

async function init(config, services) {
  const tokensService = new Users.Tokens({
    Model: config.knex,
    name: config.schemas.userToken,
    id: 'id',
    paginate: {
      default: 20,
      max: 100
    },
    interfaces: {
      sendToken: sendToken.bind(null, config)
    }
  });

  const service = new Users({
    Model: config.knex,
    name: config.schemas.user,
    paginate: {
      default: 20,
      max: 100
    },
    multi: true,
    schemas: _.pick(config.schemas, [
      // explicit list schemas used by service
      'user', 'apiKeySet', 'unsubscribed', 'key', 'userToken'
    ]),
    imagePath: config.aws.imageBucketPath,
    files: {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey,
      tmpPath: config.tmpFolderPath
    },
    getTokensService: () => tokensService,
    interfaces: {
      beforeRemove: beforeRemove.bind(null, { services }),
      beforeCreate,
      onCreate,
      onGenerateApiKey,
      onActivation,
      getAgenda: (agendaUid, cb) => agendas.get({ uid: agendaUid }, cb),
      keys: {
        get: identifiers => keys(identifiers).get(),
        create: (identifiers, data) => keys(identifiers).create(data),
        remove: identifiers => keys(identifiers).remove()
      }
    },
    logger: config.getLogConfig('svc', 'users', false)
  });

  hooks(service, [
    replaceIdMe()
  ]);
  hooks(service, svcHooks);

  for (const prop of walkProtoChain(service)) {
    module.exports[prop] = typeof service[prop] === 'function'
      ? service[prop].bind(service)
      : service[prop];
  }

  return service;
}
