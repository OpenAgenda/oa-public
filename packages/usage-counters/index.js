import logs from '@openagenda/logs';
import increment from './increment';
import clearAndDumpBucket from './clearAndDumpBucket';
import task from './task';
import clear from './clearRedisKeys';

export default function UsageCounters({ config, logger }) {
  if (logger) {
    logs.setModuleConfig(logger);
  }
  const internals = {};

  Object.assign(internals, {
    knexClient: config.knexClient,
    redisClient: config.redisClient,
    lifespan: config.lifespan ?? 1000 * 60 * 60,
    clearAndDumpBucket: clearAndDumpBucket.bind(null, internals),
    setKey: config.redisSetKey ?? 'existingKeys',
    redisPrefix: config.redisPrefix ?? 'usageCounter',
  });

  return {
    increment: increment.bind(null, internals),
    task: task.bind(null, internals),
    clear: clear.bind(null, internals),
  };
}
