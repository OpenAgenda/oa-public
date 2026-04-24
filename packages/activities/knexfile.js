'use strict';

const config = require('./testconfig');

module.exports = {
  client: 'mysql2',
  connection: config.mysql,
  schemas: config.schemas,
};
