import logger from '@openagenda/logs';
import batch from './lib/batch.js';
import batchRemove from './lib/batchRemove.js';
import clear from './lib/clear.js';
import embedClear from './lib/embedClear.js';
import insert from './lib/insert.js';
import locationSet from './lib/locationSet.js';
import locationRemove from './lib/locationRemove.js';
import memberRemove from './lib/memberRemove.js';
import memberSet from './lib/memberSet.js';
import middleware from './lib/middleware.js';
import queue from './lib/queue.js';
import remove from './lib/remove.js';
import rebuild from './lib/rebuild.js';
import set from './lib/set.js';
import setTags from './lib/setTags.js';
import setCategories from './lib/setCategories.js';
import task from './lib/task.js';
import update from './lib/update.js';

export default function ControlData({ knex, redis, prefix, imagePath }) {
  const config = {
    knex,
    prefix,
    redis,
  };

  // knex and redis connections should be handled in integrated app
  return {
    batch: batch.bind(null, config),
    batchRemove: batchRemove.bind(null, config),
    clear: clear.bind(null, config),
    insert: insert.bind(null, config),
    memberRemove: memberRemove.bind(null, config),
    memberSet: memberSet.bind(null, config),
    locationSet: locationSet.bind(null, config),
    locationRemove: locationRemove.bind(null, config),
    middleware: middleware.bind(null, config),
    embedMiddleware: middleware.embed.bind(null, {
      knex,
      redis,
      prefix,
      imagePath,
    }),
    embedClear: embedClear.bind(null, config),
    queue: queue.bind(null, config),
    rebuild: rebuild.bind(null, config),
    remove: remove.bind(null, config),
    set: set.bind(null, config),
    setTags: setTags.bind(null, config),
    setCategories: setCategories.bind(null, config),
    task: task.bind(null, config),
    update: update.bind(null, config),
  };
}

export function updateLoggerConfig(config) {
  logger.setModuleConfig(config);
}

ControlData.updateLoggerConfig = updateLoggerConfig;
