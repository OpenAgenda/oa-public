import _ from 'lodash';
import keys from '@openagenda/keys';

export async function init(config, { redis }) {
  await keys.init({
    knex: config.knex,
    schemas: _.pick(config.schemas, 'key', 'user', 'apiKeySet'),
    migrations: {
      tableName: 'key_migrations',
    },
    redis: {
      client: redis,
      prefix: 'keys',
    },
    cache: {
      duration: 60,
    },
  });

  return keys;
}
