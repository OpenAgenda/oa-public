'use strict';

const cleanOld = require('../../utils/cleanOld');

module.exports = config => cleanOld({
  knex: config.knex,
  keepTime: config.keepTime,
  table: config.schemas.activity,
  orderColumn: 'created_at',
  name: 'activities'
});
