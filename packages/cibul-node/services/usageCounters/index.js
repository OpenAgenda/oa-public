import usageCounters from '@openagenda/usage-counters';
import increment from './middleware/increment.js';

export function init(config, services) {
  return {
    ...usageCounters({
      logger: config.getLogConfig('svc', 'usage-counters'),
      redisClient: services.redis,
      knex: config.knex,
      lifespan: 1000 * 60 * 60,
      redisPrefix: null,
      setKey: null,
    }),
    mw: {
      increment,
    },
  };
}
