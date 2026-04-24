import logs from '@openagenda/logs';
import increment from './increment.js';
import clearAndDumpBucket from './clearAndDumpBucket.js';
import task from './task.js';
import clear from './clearRedisKeys.js';

export default function UsageCounters(config) {
  const { logger } = config;

  if (logger) {
    logs.setModuleConfig(logger);
  }
  const internals = {};

  Object.assign(internals, {
    knex: config.knex,
    redisClient: config.redisClient,
    lifespan: config.lifespan ?? 1000 * 60 * 60,
    clearAndDumpBucket: clearAndDumpBucket.bind(null, internals),
    setKey: config.redisSetKey ?? 'existingKeys',
    redisPrefix: config.redisPrefix ?? 'usageCounter',
    schema: config.schema ?? 'usage_counter',
  });

  return {
    increment: increment.bind(null, internals),
    task: task.bind(null, internals),
    clear: clear.bind(null, internals),
  };
}
