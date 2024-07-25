import usageCounters from '@openagenda/usage-counters';
import increment from './middleware/increment.js';

export function init(config) {
  return {
    ...usageCounters({
      logger: config.getLogConfig('svc', 'usage-counters'),
      redisClient: config.redisClient,
      knexClient: config.knex,
      lifespan: 1000 * 60 * 60,
      redisPrefix: null,
      setKey: null,
    }),
    mw: {
      increment,
    },
  };
}
