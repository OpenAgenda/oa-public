'use strict';

const { iff, isProvider, disallow: _disallow } = require('feathers-hooks-common');
const logs = require('@openagenda/logs');
const restrictToUnlogged = require('./restrictToUnlogged');
const restrictToCurrentUser = require('./restrictToCurrentUser');
const verifyHeadersPassword = require('./verifyHeadersPassword');

const log = logs('services/users/hooks');

const restrictToCurrentUserIfExternal = () => async (context, next) => {
  iff(
    isProvider('external'),
    restrictToCurrentUser(),
  )(context);

  await next();
};

const verifyHeadersPasswordIfExternal = () => async (context, next) => {
  await iff(
    isProvider('external'),
    verifyHeadersPassword(),
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

const populateAnnouncement = () => async (context, next) => {
  await next();
  log('populateAnnouncement');

  if (!context.result || !context.params.user) {
    return;
  }

  const { supervisor: { announcements } } = context.services;

  if (context.params.user.uid === context.id) {
    context.result.announcement = await announcements.get();
  }
};

const disallow = (...args) => async (context, next) => {
  _disallow(...args)(context);
  await next();
};

module.exports = {
  find: [
    disallow('external'),
  ],
  get: [
    restrictToCurrentUserIfExternal(),
    populateAnnouncement(),
  ],
  create: [
    restrictToUnloggedIfExternal(),
  ],
  update: [
    disallow(),
  ],
  patch: [
    restrictToCurrentUserIfExternal(),
  ],
  remove: [
    restrictToCurrentUserIfExternal(),
    verifyHeadersPasswordIfExternal(),
  ],
  requestChangeEmail: [
    restrictToCurrentUserIfExternal(),
    verifyHeadersPasswordIfExternal(),
  ],
  confirmChangeEmail: [],
  changePassword: [
    restrictToCurrentUserIfExternal(),
  ],
  generateApiKey: [
    restrictToCurrentUserIfExternal(),
  ],
  setNewFlag: [
    restrictToCurrentUserIfExternal(),
  ],
  refresh: [
    restrictToCurrentUserIfExternal(),
  ],
};
