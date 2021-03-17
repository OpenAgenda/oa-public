'use strict';

const log = require('@openagenda/logs')('merge');

const BadRequestError = require('@openagenda/utils/errors/BadRequestError');
const list = require('./list');
const get = require('./get');
const update = require('./update');
const remove = require('./remove');
const allow = require('./lib/AllowAction');

async function merge(service, mergeInItem, items, data = {}) {
  log('received %j', items);
  await allow(service, 'merge', mergeInItem.uid);

  const toBeMerged = items.filter(i => i.uid !== mergeInItem.uid);

  if (!toBeMerged.length) {
    throw new BadRequestError('Nothing to merge');
  }

  if (service.interfaces.beforeMerge) {
    await service.interfaces.beforeMerge(mergeInItem, toBeMerged);
  }

  log('updating merged location'); // if data
  const updatedMerged = data ? await update(
    { service, isPatch: true },
    mergeInItem.uid,
    data
  ) : mergeInItem;

  log('removing other locations'); // why not remove with remove fn?
  for (const location of toBeMerged) {
    await remove(service, location);
  }

  log('merge complete');

  return updatedMerged;
}

module.exports = async (service, mergeInUid, query, data, options) => merge(
  service,
  await get(service, mergeInUid),
  await list(service, query, {}, { ...options, total: null, detailed: true }),
  data
);

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  mergeInUid,
  query,
  data,
  options = {}
) => merge(
  service,
  await get.byAgendaUid(service, agendaUid, mergeInUid),
  await list.byAgendaUid(
    service,
    agendaUid,
    query,
    {},
    { ...options, total: null, detailed: true }
  ),
  data
);

module.exports.bySetUid = async (
  service,
  setUid,
  mergeInUid,
  query,
  data,
  options = {}
) => merge(
  service,
  await get.bySetUid(service, setUid, mergeInUid),
  await list.bySetUid(
    service,
    setUid,
    query,
    {},
    { ...options, total: null, detailed: true }
  ),
  data
);
