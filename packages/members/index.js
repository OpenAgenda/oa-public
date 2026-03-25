import logger from '@openagenda/logs';
import get from './get.js';
import list from './list.js';
import stream from './stream.js';
import create from './create.js';
import patch from './patch.js';
import remove from './remove.js';
import setByEmail from './setByEmail.js';
import * as utils from './utils.js';
import invalidateListCache from './lib/invalidateListCache.js';

function Service(options = {}) {
  const config = {
    knex: null,
    schema: 'member',
    interfaces: {},
    bulkThreshold: 10,
    redis: null,
    cachePrefix: 'members:list',
    cacheTTL: 30_000,
    ...options,
  };

  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  const service = {
    get: Object.assign(get.bind(null, config), {
      byEmail: get.byEmail.bind(null, config),
    }),
    list: list.bind(null, config),
    create: create.bind(null, config),
    patch: Object.assign(patch.bind(null, config), {
      actions: {
        increment: patch.actionsIncrement.bind(null, config),
      },
    }),
    remove: remove.bind(null, config),
    stream: stream.bind(null, config),
    set: {
      byEmail: Object.assign(setByEmail.bind(null, config), {
        bulk: setByEmail.bulk.bind(null, config),
      }),
    },
    invalidateListCache: invalidateListCache.bind(null, config),
    clearCache: async () => {
      if (!config.redis) return;
      const keys = await config.redis.keys(`${config.cachePrefix}:*`);
      if (keys.length) await Promise.all(keys.map((key) => config.redis.del(key)));
    },
    utils,
  };

  service.task = setByEmail.task.bind(null, service, config);

  service.shutdown = async () => {
    await service.worker?.close();
  };

  return service;
}

Service.utils = utils;

export default Service;

export { utils };
