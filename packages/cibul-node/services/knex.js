'use strict';

const knexLib = require('knex');
const log = require('@openagenda/logs')('services/knex');

module.exports.init = config => {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql',
    connection: config.db,
    pool: { min: 0, max: 20 },
    schemas: config.schemas
  });

  config.knex = knex;

  knex.on('query-error', error => {
    log.error('Knex query error:', { error });
  });

  return Object.assign(knex, {
    shutdown: async () => {
      await knex.destroy();
    }
  });
};
