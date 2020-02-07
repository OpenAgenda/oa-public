'use strict';

const { iff, isProvider, disallow: _disallow } = require('feathers-hooks-common');
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

module.exports = {
  find: [
    disallow('external')
  ],
  get: [
    restrictToCurrentUserIfExternal()
  ],
  create: [
    restrictToUnloggedIfExternal()
  ],
  update: [
    disallow()
  ],
  patch: [
    restrictToCurrentUserIfExternal()
  ],
  remove: [
    restrictToCurrentUserIfExternal()
  ],
  setImageProfile: [
    restrictToCurrentUserIfExternal()
  ],
  clearImageProfile: [
    restrictToCurrentUserIfExternal()
  ],
  requestChangeEmail: [
    restrictToCurrentUserIfExternal()
  ],
  confirmChangeEmail: [],
  changePassword: [
    restrictToCurrentUserIfExternal()
  ],
  generateApiKey: [
    restrictToCurrentUserIfExternal()
  ],
  setNewFlag: [
    restrictToCurrentUserIfExternal()
  ],
  refresh: [
    restrictToCurrentUserIfExternal()
  ]
};
