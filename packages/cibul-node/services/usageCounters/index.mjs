import usageCounters from '@openagenda/usage-counters';
import increment from './middleware/increment.mjs';

export function init(config) {
  return {
    ...usageCounters({
      logger: config.getLogConfig('svc', 'usage-counters'),
      config: {
        redisClient: config.redisClient,
        knexClient: config.knex,
        lifespan: 1000 * 60 * 60,
        redisPrefix: null,
        setKey: null,
      },
    }),
    mw: {
      increment,
    },
  };
}
