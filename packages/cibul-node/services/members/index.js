'use strict';

const Service = require('@openagenda/members');
const log = require('@openagenda/logs')('services/members');

const activities = require('./lib/activities');

const getEventCountByUserUid = require('./getEventCountByUserUid');
const getUsersByUid = require('./getUsersByUid');
const getUserByEmail = require('./getUserByEmail');
const getAgendasByUid = require('./getAgendasByUid');
const onCreate = require('./onCreate');
const onRemove = require('./onRemove');
const onPatch = require('./onPatch');

const plugApp = require('./plugApp');
const mw = require('./middleware');
const mail = require('./lib/mail');

const members = {};
const config = {};

function init(c, services) {
  Object.assign(config, c);

  const {
    queues,
  } = services;

  const activityQueue = queues('memberActivities');
  const messageQueue = queues('memberMessages');

  Object.assign(members, Service({
    knex: config.knex,
    schema: 'reviewer',
    queues,
    bulkThreshold: 10,
    logger: config.getLogConfig('svc', 'members'),
    interfaces: {
      getEventCountByUserUid: getEventCountByUserUid.bind(null, services),
      getUsersByUid: getUsersByUid.bind(null, services),
      getUserByEmail: getUserByEmail.bind(null, services),
      getAgendasByUid: getAgendasByUid.bind(null, services),
      onCreate: onCreate.bind(null, { services, config, activityQueue }),
      onRemove: onRemove({ services, members, activityQueue }),
      onPatch: onPatch.bind(null, { services, config, activityQueue }),
    },
  }));

  const messages = mail.messages(config, {
    members,
    queue: messageQueue,
  });

  const {
    task: activityTask,
  } = activities({ queue: activityQueue });

  mw.sendMessage.init(messages);

  return Object.assign(
    module.exports,
    members,
    {
      task: () => {
        log('running tasks');
        members.task();
        messages.task();
        activityTask();
      },
      mw: {
        load: mw.load,
        loadOrFail: mw.load.orFail,
        loadOr: mw.load.or,
        list: mw.list.bind(null, members),
        loadAndAuthorize: mw.load.andAuthorize,
        authorizeAdminModOrEventOwner: mw.authorize.adminModOrEventOwner,
        authorizeAdminModOrKey: mw.authorize.adminModOrKey,
        loadTarget: Object.assign(mw.loadTarget.bind(null, members), {
          options: mw.loadTarget.options.bind(null, members),
        }),
      },
    },
  );
}

module.exports = Object.assign(plugApp, {
  init,
  utils: Service.utils,
});
