import path from 'node:path';
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

  // add migrations config to the knex client
  if (c.migrations !== null) {
    Object.assign(config.knex.client.config, {
      migrations: {
        ...c.migrations,
        directory: path.resolve(
          path.dirname(import.meta.dirname),
          'migrations',
        ),
      },
    });
  }

  if (!c.redis.client) {
    throw new Error('redis client is missing');
  }
  config.redis.client = c.redis.client;

  if (config.knex.client.config.migrations) {
    await config.knex.migrate.latest();
  }
}

config.init = init;

export default config;

export { init };
