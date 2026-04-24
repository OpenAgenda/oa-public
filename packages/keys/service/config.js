import _ from 'lodash';
import logs from '@openagenda/logs';

const config = {
  knex: null,
  redis: {
    prefix: 'keys',
  },
};

async function init(c) {
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  _.merge(config, _.pick(c, ['schemas', 'redis', 'cache']));

  config.knex = c.knex;

  Object.assign(config.knex.client.config, {
    schemas: {
      ...config.knex.client.config.schemas,
      ...config.schemas,
    },
  });

  if (!c.redis.client) {
    throw new Error('redis client is missing');
  }
  config.redis.client = c.redis.client;
}

config.init = init;

export default config;

export { init };
