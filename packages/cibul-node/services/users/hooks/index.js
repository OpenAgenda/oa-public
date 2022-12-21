'use strict';

const { iff, isProvider, disallow: _disallow } = require('feathers-hooks-common');
const restrictToUnlogged = require('./restrictToUnlogged');
const restrictToCurrentUser = require('./restrictToCurrentUser');

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

const populateAnnouncement = () => async (context, next) => {
  await next();

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
  ],
  requestChangeEmail: [
    restrictToCurrentUserIfExternal(),
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
