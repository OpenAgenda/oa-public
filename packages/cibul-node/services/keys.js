'use strict';

const _ = require('lodash');
const keys = require('@openagenda/keys');

module.exports.init = async (config, services) => {
  await keys.init({
    mysql: config.db,
    knex: config.knex,
    schemas: _.pick(config.schemas, 'key', 'user', 'apiKeySet'),
    migrations: {
      tableName: 'key_migrations',
    },
    redis: {
      client: services.redis,
      prefix: 'keys',
    },
    cache: {
      duration: 60,
    },
  });

  return keys;
};
