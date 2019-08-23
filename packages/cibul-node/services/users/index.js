"use strict";

const _ = require('lodash');
const Proto = require('uberproto');
const { iff, isProvider, disallow } = require('feathers-hooks-common');
const update = require('immutability-helper');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const errors = require('@feathersjs/errors');
const Users = require('@openagenda/users');
const keys = require('@openagenda/keys');
const agendas = require('@openagenda/agendas');
const sessions = require('@openagenda/sessions');
const mails = require('@openagenda/mails');
const imageUploadMw = require('@openagenda/image-upload/lib/middleware');
const labels = require('@openagenda/labels/users/settings');
const getLabels = require('@openagenda/labels/makeLabelGetter')(labels);
const beforeCreate = require('./beforeCreate');
const beforeRemove = require('./beforeRemove');
const onCreate = require('./onCreate');
const onGenerateApiKey = require('./onGenerateApiKey');
const onActivation = require('./onActivation');
const sendToken = require('./sendToken');
const config = require('../../config');

const service = Object.create(Users.prototype);

function restrictToCurrentUser() {
  return context => {
    if (!context.params.user) {
      throw new errors.NotAuthenticated('You are not authenticated.');
    }

    if (context.params.user.uid === undefined) {
      throw new errors.Forbidden('uid is missing from current user.');
    }

    if (context.params.user.uid !== context.id) {
      throw new errors.Forbidden('You do not have the permissions to access this.');
    }
  };
}

function restrictToUnlogged() {
  return context => {
    if (context.params.user) {
      throw new errors.Forbidden(`You must not be logged in.`);
    }
  };
}

const restrictToCurrentUserIfExternal = [
  iff(
    isProvider('external'),
    restrictToCurrentUser(),
  )
];

const hooks = update(Users.hooks, {
  before: {
    all: {
      $unshift: [
        context => {
          if (context.id !== 'me') {
            return;
          }

          if (!context.params.user || !context.params.user.uid) {
            throw new errors.NotAuthenticated('You should be logged');
          }

          context.id = context.params.user.uid;
        }
      ],
    },
    create: {
      $unshift: [
        iff(
          isProvider('external'),
          restrictToUnlogged()
        )
      ]
    },
    get: {
      $unshift: restrictToCurrentUserIfExternal
    },
    find: {
      $unshift: [
        disallow('external')
      ]
    },
    update: {
      $set: disallow()
    },
    patch: {
      $unshift: restrictToCurrentUserIfExternal
    },
    remove: {
      $unshift: restrictToCurrentUserIfExternal
    },
    setImageProfile: {
      $unshift: restrictToCurrentUserIfExternal
    },
    clearImageProfile: {
      $unshift: restrictToCurrentUserIfExternal
    },
    requestChangeEmail: {
      $unshift: restrictToCurrentUserIfExternal
    },
    // confirmChangeEmail: {
    //   $unshift: restrictToCurrentUserIfExternal
    // },
    changePassword: {
      $unshift: restrictToCurrentUserIfExternal
    },
    generateApiKey: {
      $unshift: restrictToCurrentUserIfExternal
    },
    setNewFlag: {
      $unshift: restrictToCurrentUserIfExternal
    },
    refresh: {
      $unshift: restrictToCurrentUserIfExternal
    },
  }
});

module.exports = service;

module.exports.expose = app => {
  app.use('/users', (req, res, next) => {
    req.feathers.user = req.user;
    req.feathers.authenticated = req.authenticated = !!req.user;

    next();
  });

  app.post('/users/:__feathersId/setImageProfile', (req, res, next) => {
    imageUploadMw({
      dest: config.tmpFolderPath,
      handler: async (path, info, cb) => {
        try {
          const result = await service.setImageProfile(
            req.params.__feathersId,
            { path },
            {
              ...req.feathers,
              provider: 'rest',
              query: req.query
            }
          );

          res.data = result;

          cb(null, result.uploadedPaths[0]);
        } catch (e) {
          next(e);
        }
      }
    })(req, res, next);
  });

  app.use('/users', service);

  // update session after a user patch
  app.patch(
    '/users/:__feathersId',
    sessions.middleware.open('user', 'sessionResult'),
    (req, res, next) => {
      if (!res.data) {
        return next();
      }

      sessions.middleware.sync('syncResult')(req, res, next);
    }
  );

  // send confirmation email after requestChangeEmail
  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    (req, res, next) => {
      if (res.data) {
        service.get(res.data.uid, { internal: true })
          .then(user => {
            const email = user.store && user.store.newEmail;
            const token = user.store && user.store.newEmailToken;

            if (!token) {
              return next();
            }

            const link = `${config.root}/users/${user.uid}/confirmChangeEmail?token=${token}`;

            sendEmailForChange({
              user,
              email,
              link,
              lang: req.lang
            });

            next();

          })
          .catch(next);
      }
    }
  );

  // set flash message after confirm change of email
  app.get(
    '/users/:__feathersId/confirmChangeEmail',
    (req, res, next) => {
      if (res.data) {
        sessions.setFlash(
          req,
          res,
          getLabels(res.data ? 'changeEmailSuccess' : 'changeEmailFail', req.lang)
        );

        return res.redirect('/home');
      }

      next();
    }
  );

  // set flash & redirect message after account deletion
  app.delete(
    '/users/:__feathersId',
    (req, res, next) => {
      if (res.data) {
        sessions.setFlash(req, res, getLabels('accountRemoved', req.lang));
      }

      next();
    }
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
    .use( '/', instance )
    .setup();

  const svc = subApp
    .service('/')
    .hooks(hooks);

  Proto.mixin(svc, service);
};


function sendEmailForChange({ user, email, link, lang }) {
  mails({
    template: 'changeEmail',
    to: email,
    data: {
      link
    },
    lang
  });
}
