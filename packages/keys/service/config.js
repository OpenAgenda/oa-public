import path from 'node:path';
import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('config');

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
    try {
      await config.knex.migrate.latest();
    } catch (e) {
      log('error', 'failed to migrate to latest', e);
    }
  }
}

config.init = init;

export default config;

export { init };
