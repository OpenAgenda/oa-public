'use strict';

const config = require('./testconfig');

module.exports = {
  client: 'mysql2',
  connection: config.mysql,
  migrations: config.migrations,
  schemas: config.schemas,
};
