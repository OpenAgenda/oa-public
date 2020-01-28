'use strict';

const { iff, isProvider, disallow: _disallow } = require('feathers-hooks-common');
const { withParams } = require('@feathersjs/hooks');
const errors = require('@feathersjs/errors');
const restrictToUnlogged = require('./hooks/restrictToUnlogged');
const restrictToCurrentUser = require('./hooks/restrictToCurrentUser');

const restrictToCurrentUserIfExternal = () => async (context, next) => {
  iff(
    isProvider('external'),
    restrictToCurrentUser(),
  )(context);

  await next();
};

const restrictToUnloggedIfExternal = () => async (context, next) => {
  iff(
    isProvider('external'),
    restrictToUnlogged(),
  )(context);

  await next();
};

const disallow = (...args) => async (context, next) => {
  _disallow(...args)(context);
  await next();
};

const replaceIdMe = () => async (context, next) => {
  if (context.id !== 'me') {
    return next();
  }

  if (!context.params.user || !context.params.user.uid) {
    throw new errors.NotAuthenticated('You should be logged');
  }

  context.id = context.params.user.uid;

  await next();
};

module.exports = {
  find: {
    middleware: [
      replaceIdMe(),
      disallow('external')
    ],
    context: withParams('params')
  },
  get: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'params')
  },
  create: {
    middleware: [
      replaceIdMe(),
      restrictToUnloggedIfExternal()
    ],
    context: withParams('data', 'params')
  },
  update: {
    middleware: [
      replaceIdMe(),
      disallow()
    ],
    context: withParams('id', 'data', 'params')
  },
  patch: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  },
  remove: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'params')
  },
  setImageProfile: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  },
  clearImageProfile: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'params')
  },
  requestChangeEmail: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  },
  confirmChangeEmail: {
    middleware: [
      replaceIdMe()
    ],
    context: withParams('id', 'params')
  },
  changePassword: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  },
  generateApiKey: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'params')
  },
  setNewFlag: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  },
  refresh: {
    middleware: [
      replaceIdMe(),
      restrictToCurrentUserIfExternal()
    ],
    context: withParams('id', 'data', 'params')
  }
};
