import Service from '@openagenda/members';
import logs from '@openagenda/logs';
import activitiesTask from './lib/activities.js';
import getEventCountByUserUid from './getEventCountByUserUid.js';
import getUsersByUid from './getUsersByUid.js';
import getUserByEmail from './getUserByEmail.js';
import getAgendasByUid from './getAgendasByUid.js';
import onCreate from './onCreate.js';
import onRemove from './onRemove.js';
import onPatch from './onPatch.js';
import plugApp from './plugApp.js';
import * as mw from './middleware/index.js';
import listAllAdminMods from './lib/listAllAdminMods.js';
import SendGroupMail from './lib/SendGroupMail/index.js';

const log = logs('services/members');

const members = {};

export function init(config, services) {
  const { queues } = services;

  const activityQueue = queues('memberActivities');

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

  const {
    task: activityTask,
  } = activitiesTask({ queue: activityQueue });

  members.utils.listAllAdminMods = listAllAdminMods(members);

  const sendGroupMail = SendGroupMail(config, services);

  return Object.assign(
    plugApp, // module.exports
    members,
    {
      task: () => {
        log('running tasks');
        members.task();
        sendGroupMail.task();
        activityTask();
      },
      sendGroupMail,
      mw: {
        load: mw.load.default,
        loadOrFail: mw.load.orFail,
        loadOr: mw.load.or,
        list: mw.list.default.bind(null, members),
        loadAndAuthorize: mw.load.andAuthorize,
        authorizeAdminModOrEventOwner: mw.authorize.adminModOrEventOwner,
        authorizeAdminModOrKey: mw.authorize.adminModOrKey,
        loadTarget: Object.assign(mw.loadTarget.default.bind(null, members), {
          options: mw.loadTarget.options.bind(null, members),
        }),
      },
    },
  );
}

export default Object.assign(plugApp, {
  utils: Service.utils,
});
