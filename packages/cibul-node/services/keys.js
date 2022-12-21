'use strict';

const _ = require('lodash');
const keys = require('@openagenda/keys');

module.exports.init = async config => {
  await keys.init({
    mysql: config.db,
    knex: config.knex,
    schemas: _.pick(config.schemas, 'key', 'user', 'apiKeySet'),
    migrations: {
      tableName: 'key_migrations',
    },
    redis: {
      connection: config.redis,
    },
    cache: {
      duration: 60,
    },
  });

  return keys;
};
