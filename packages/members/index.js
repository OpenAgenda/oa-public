import logger from '@openagenda/logs';
import get from './get.js';
import list from './list.js';
import stream from './stream.js';
import create from './create.js';
import patch from './patch.js';
import remove from './remove.js';
import setByEmail from './setByEmail.js';
import * as utils from './utils.js';

function Service(options = {}) {
  const config = {
    knex: null,
    schema: 'member',
    interfaces: {},
    bulkThreshold: 10,
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
    utils,
  };

  service.task = setByEmail.task.bind(null, service, config);

  service.shutdown = async () => {
    await service.oldQueue?.stop();
    await service.worker?.close();
  };

  return service;
}

Service.utils = utils;

export default Service;

export { utils };
