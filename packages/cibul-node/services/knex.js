'use strict';

const knexLib = require('knex');

module.exports.init = config => {
  const knex = knexLib({
    client: 'mysql',
    connection: config.db,
    pool: { min: 0, max: 20 },
    schemas: config.schemas
  });

  config.knex = knex;

  return knex;
};
