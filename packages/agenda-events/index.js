import knex from 'knex';
import logger from '@openagenda/logs';
import list from './service/list.js';
import get from './service/get.js';
import getAggregatedCount from './service/getAggregatedCount.js';
import create from './service/create.js';
import update from './service/update.js';
import set from './service/set.js';
import remove from './service/remove.js';
import * as validate from './iso/validate.js';
import * as legacy from './service/legacy.js';
import * as stats from './service/stats.js';
import interfacesTask from './tasks/interfaces.js';
import setSourcePaths from './utils/setSourcePaths.js';
import states from './iso/states.js';

export default (c) => {
  const config = {
    queueNames: {
      interfaces: 'agendaEventInterfaces',
    },
    ...c,
  };

  const { queue } = config;

  const { interfaces } = config;

  if (queue) {
    queue.register({
      onRemove: interfaces.onRemove,
    });
  }

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  const service = {
    config,
    queue,
    client:
      config.knex
      || knex({
        client: 'mysql',
        connection: config.mysql,
      }),
    redisClient: config.redisClient,
  };

  Object.assign(service, {
    get: get.bind(null, service),
    getByLegacyId: get.byLegacyId.bind(null, service),
    getAggregatedCount: getAggregatedCount(service),
    create: create.bind(null, service),
    update: update.bind(null, service),
    set: set.bind(null, service),
    remove: remove.bind(null, service),
    removeByEventUid: remove.byEventUid.bind(null, service),
    removeByLegacyId: remove.byLegacyId.bind(null, service),
    list: list.bind(null, service),
    listByLastId: list.byLastId.bind(null, service),
    listByUserUid: list.byUserUid.bind(null, service),
    listByEventUid: list.byEventUid.bind(null, service),
    toLegacy: legacy.to.bind(null, service),
    fromLegacy: legacy.from.bind(null, service),
    removeLegacy: legacy.remove.bind(null, service),
    countByUserUid: stats.countByUserUid.bind(null, service),
    interfacesTask: interfacesTask.bind(null, service),
  });

  service.exposed = Object.assign(
    (agendaUid) => ({
      list: service.list.bind(null, agendaUid),
      listByLastId: service.listByLastId.bind(null, agendaUid),
      get: service.get.bind(null, agendaUid),
      getAggregatedCount: service.getAggregatedCount.bind(null, agendaUid),
      create: service.create.bind(null, agendaUid),
      update: service.update.bind(null, agendaUid),
      remove: service.remove.bind(null, agendaUid),
      set: service.set.bind(null, agendaUid),
      stats: {
        countByUserUid: service.countByUserUid.bind(null, agendaUid),
      },
    }),
    {
      list: {
        byEventUid: service.listByEventUid,
        byUserUid: service.listByUserUid,
      },
      get: {
        byLegacyId: service.getByLegacyId,
      },
      remove: Object.assign(service.removeByEventUid, {
        byLegacyId: service.removeByLegacyId,
      }),
      tasks: {
        interfaces: service.interfacesTask,
      },
      legacyTransfer: Object.assign(service.fromLegacy, {
        to: service.toLegacy,
        remove: service.removeLegacy,
      }),
      validate: validate.validateData,
      utils: {
        setSourcePaths: setSourcePaths.bind(null, service),
      },
      states,
    },
  );

  return service.exposed;
};

export { states };
