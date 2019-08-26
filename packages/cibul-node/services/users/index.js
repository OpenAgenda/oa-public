"use strict";

const _ = require('lodash');
const Proto = require('uberproto');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const Users = require('@openagenda/users');
const keys = require('@openagenda/keys');
const agendas = require('@openagenda/agendas');
const sessions = require('@openagenda/sessions');
const hooks = require('./hooks');
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

const service = Object.create(Users.prototype);

module.exports = service;

module.exports.expose = app => {
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

  app.use('/users', service);

  // ensure to use the service with the good app
  Proto.mixin(app.service('/users'), service);

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

  app.use('/users', express.errorHandler({ html: false }));
};

module.exports.init = config => {
  const instance = new Users({
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
    interfaces: {
      beforeRemove,
      beforeCreate,
      onCreate,
      onGenerateApiKey,
      onActivation,
      sendToken: sendToken.bind(null, config),
      getAgenda: (agendaUid, cb) => agendas.get({ uid: agendaUid }, cb),
      keys: {
        get: identifiers => keys(identifiers).get(),
        create: (identifiers, data) => keys(identifiers).create(data),
        remove: identifiers => keys(identifiers).remove()
      }
    },
    logger: config.getLogConfig('svc', 'users', false)
  });

  const subApp = feathers()
    .use('/', instance)
    .setup();

  const svc = subApp
    .service('/')
    .hooks(hooks);

  Proto.mixin(svc, service);
};
