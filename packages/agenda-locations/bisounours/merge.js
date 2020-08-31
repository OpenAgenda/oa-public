'use strict';

const log = require('@openagenda/logs')('merge');

const BadRequestError = require('./lib/BadRequestError');
const list = require('./list');
const update = require('./update');

async function merge(service, items, data) {
  log('received %j', items);

  if (items.length < 2) {
    throw new BadRequestError('Nothing to merge');
  }

  const merged = items.slice(0, -1);
  const mergeIn = items[items.length -1];

  const updatedMerged = await update({ service, isPatch: true }, mergeIn.uid, data);

  await service.interfaces.locationsWillMerge(mergeIn, merged);

  await service.clients.knex(service.config.schema)
    .whereIn('uid', merged.map(l => l.uid))
    .del();

  return updatedMerged;
}

module.exports = async (service, query, data, options) => merge(
  service,
  await list(service, query, {}, { ...options, total: null, detailed: true }),
  data
);

module.exports.byAgendaUid = async (service, agendaUid, query, data, options = {}) => merge(
  service,
  await list.byAgendaUid(service, agendaUid, query, {}, { ...options, total: null, detailed: true }),
  data
);
