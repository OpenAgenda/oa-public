import knex from 'knex';
import logger from '@openagenda/logs';
import list from './service/list.js';
import listRemoved from './service/listRemoved.js';
import get from './service/get.js';
import getAggregatedCount from './service/getAggregatedCount.js';
import create from './service/create.js';
import update from './service/update.js';
import set from './service/set.js';
import remove from './service/remove.js';
import * as validate from './iso/validate.js';
import * as stats from './service/stats.js';
import setSourcePaths from './utils/setSourcePaths.js';
import states from './iso/states.js';

export default (config) => {
  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  const service = {
    config,
    client:
      config.knex
      || knex({
        client: 'mysql2',
        connection: config.mysql,
      }),
    redisClient: config.redisClient,
  };

  Object.assign(service, {
    get: get.bind(null, service),
    getAggregatedCount: getAggregatedCount(service),
    create: create.bind(null, service),
    update: update.bind(null, service),
    set: set.bind(null, service),
    remove: remove.bind(null, service),
    list: list.bind(null, service),
    listByLastId: list.byLastId.bind(null, service),
    listByUserUid: list.byUserUid.bind(null, service),
    listByEventUid: list.byEventUid.bind(null, service),
    countByUserUid: stats.countByUserUid.bind(null, service),
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
        removed: listRemoved.bind(null, service),
      },
      remove: remove.byEventUid.bind(null, service),
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
