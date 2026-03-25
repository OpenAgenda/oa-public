import Service from '@openagenda/members';
import logs from '@openagenda/logs';
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

export function init(config, services) {
  const { bull } = services;

  const queue = new bull.Queue('members', { prefix: '{members}' });
  const createWorker = (processor) =>
    new bull.Worker(queue.name, processor, {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    });

  const service = Service({
    knex: config.knex,
    schema: 'reviewer',
    queue,
    createWorker,
    bulkThreshold: 10,
    logger: config.getLogConfig('svc', 'members'),
    redis: services.redis.ioRedis,
    cacheTTL: 30_000,
    interfaces: {
      getEventCountByUserUid: getEventCountByUserUid.bind(null, services),
      getUsersByUid: getUsersByUid.bind(null, services),
      getUserByEmail: getUserByEmail.bind(null, services),
      getAgendasByUid: getAgendasByUid.bind(null, services),
      onCreate: onCreate.bind(null, { services, config }),
      onRemove: onRemove({ services }),
      onPatch: onPatch.bind(null, { services, config }),
    },
  });

  const membersTask = service.task; // will be overridden
  const sendGroupMail = SendGroupMail(config, services);

  return Object.assign(service, {
    task: () => {
      log('running tasks');
      membersTask();
      sendGroupMail.task();
    },
    plugApp,
    sendGroupMail,
    listAllAdminMods: listAllAdminMods(service),
    mw: {
      load: mw.load.default,
      loadOrFail: mw.load.orFail,
      loadOr: mw.load.or,
      list: mw.list.default.bind(null, service),
      loadAndAuthorize: mw.load.andAuthorize,
      authorizeAdminModOrEventOwner: mw.authorize.adminModOrEventOwner,
      authorizeAdminModOrKey: mw.authorize.adminModOrKey,
      loadTarget: Object.assign(mw.loadTarget.default.bind(null, service), {
        options: mw.loadTarget.options.bind(null, service),
      }),
    },
  });
}

export default Object.assign(plugApp, {
  utils: Service.utils,
});
