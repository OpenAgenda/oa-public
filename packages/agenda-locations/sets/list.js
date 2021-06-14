'use strict';

const log = require('@openagenda/logs')('sets/list');

module.exports = async service => {
  const entry = await service.clients.knex
    .select(['uid', 'title'])
    .from(service.config.setSchema)
    .then(rows => rows.map(row => ({ ...row })));
  return entry;
};
