import hookCommon from 'feathers-hooks-common';
import logs from '@openagenda/logs';
import restrictToUnlogged from './restrictToUnlogged.js';
import restrictToCurrentUser from './restrictToCurrentUser.js';
import verifyHeadersPassword from './verifyHeadersPassword.js';

const { iff, isProvider, disallow: _disallow } = hookCommon;

const log = logs('services/users/hooks');

const restrictToCurrentUserIfExternal = () => async (context, next) => {
  iff(isProvider('external'), restrictToCurrentUser())(context);

  await next();
};

const verifyHeadersPasswordIfExternal = () => async (context, next) => {
  await iff(isProvider('external'), verifyHeadersPassword())(context);

  await next();
};

const restrictToUnloggedIfExternal = () => async (context, next) => {
  iff(isProvider('external'), restrictToUnlogged())(context);

  await next();
};

const populateAnnouncement = () => async (context, next) => {
  await next();
  log('populateAnnouncement');

  if (!context.result || !context.params.user) {
    return;
  }

  const {
    supervisor: { announcements },
  } = context.services;

  if (context.params.user.uid === context.id) {
    context.result.announcement = await announcements.get();
  }
};

const isSuperAdmin = () => async (context, next) => {
  await next();
  const { config } = context.self;

  if (!context.result || !context.params.user) {
    return;
  }

  if (config.superAdminUids.includes(context.params.user.uid)) {
    context.result.isSuperAdmin = true;
  }
};

const disallow = (...args) =>
  async (context, next) => {
    _disallow(...args)(context);
    await next();
  };

export default {
  find: [disallow('external')],
  get: [
    restrictToCurrentUserIfExternal(),
    isSuperAdmin(),
    populateAnnouncement(),
  ],
  create: [restrictToUnloggedIfExternal()],
  update: [disallow()],
  patch: [restrictToCurrentUserIfExternal()],
  remove: [
    restrictToCurrentUserIfExternal(),
    verifyHeadersPasswordIfExternal(),
  ],
  requestChangeEmail: [
    restrictToCurrentUserIfExternal(),
    verifyHeadersPasswordIfExternal(),
  ],
  confirmChangeEmail: [],
  requestUnlinkFacebook: [restrictToCurrentUserIfExternal()],
  setNewFlag: [restrictToCurrentUserIfExternal()],
  refresh: [restrictToCurrentUserIfExternal()],
};
