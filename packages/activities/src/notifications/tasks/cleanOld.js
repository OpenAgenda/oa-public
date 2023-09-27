'use strict';

const cleanOld = require('../../utils/cleanOld');

module.exports = config => cleanOld({
  knex: config.knex,
  keepTime: config.keepTime,
  table: config.schemas.feed_notification,
  orderColumn: 'updated_at',
  name: 'notifications'
});
