import logs from '@openagenda/logs';
import batch from './batch.js';
import batchRemove from './batchRemove.js';
import clear from './clear.js';
import insert from './insert.js';
import memberSet from './memberSet.js';
import memberRemove from './memberRemove.js';
import update from './update.js';
import rebuild from './rebuild.js';
import remove from './remove.js';
import set from './set.js';

const queuables = {
  batch,
  batchRemove,
  clear,
  insert,
  memberSet,
  memberRemove,
  update,
  rebuild,
  remove,
  set,
};

const log = logs('legacy/controlData/queue');

export default async (config) => {
  const { redis, prefix } = config;

  const taskRedis = redis.duplicate();

  await taskRedis.connect();

  let blPopResult;

  while ((blPopResult = await taskRedis.blPop(`${prefix}queue`, 0))) {
    try {
      const { operation, args } = JSON.parse(blPopResult.element);

      log('processing %s', operation);

      await queuables[operation].apply(null, [config].concat(args));
    } catch (e) {
      log('error', 'failed to process job %j', blPopResult.element, e);
    }
  }
};
