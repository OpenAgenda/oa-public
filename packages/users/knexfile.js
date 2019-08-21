'use strict';

const testconfig = require('./testconfig');

// Useful for the knex CLI

module.exports = {
  client: 'mysql',
  connection: testconfig.mysql,
  schemas: testconfig.schemas,
  seeds: {
    directory: './seeds/dev'
  },
  testconfig
};
