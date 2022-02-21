'use strict';

const log = require('@openagenda/logs')('merge');

const { BadRequest } = require('@openagenda/verror');
const list = require('./list');
const get = require('./get');
const update = require('./update');
const remove = require('./remove');
const authorize = require('./lib/authorize');

async function merge({ internals, endpoints }, mergeInItem, items, data = null, options = {}) {
  log('mergin ', items.length, 'location in ', mergeInItem.uid);

  await authorize(internals, 'merge', mergeInItem.uid, options);

  const toBeMerged = items.filter(i => i.uid !== mergeInItem.uid);

  if (!toBeMerged.length) {
    throw new BadRequest('Nothing to merge');
  }

  if (internals.interfaces.beforeMerge) {
    await internals.interfaces.beforeMerge(mergeInItem, toBeMerged);
  }

  log('updating merged location'); // if data
  const updatedMerged = data ? await update(
    { service: internals, isPatch: true },
    mergeInItem.uid,
    data
  ) : mergeInItem;

  log('removing other locations');
  for (const location of toBeMerged) {
    await remove({ internals, endpoints }, location, { mergedIn: mergeInItem.uid });
  }

  log('merge complete');

  return updatedMerged;
}

module.exports = async ({ internals, endpoints }, mergeInUid, query, data, options) => merge(
  { internals, endpoints },
  await get({ internals, endpoints }, mergeInUid),
  await list(internals, query, {}, { ...options, total: null, detailed: true }),
  data
);

module.exports.byAgendaUid = async (
  { internals, endpoints },
  agendaUid,
  mergeInUid,
  query,
  data,
  options = {}
) => merge(
  { internals, endpoints },
  await get.byAgendaUid({ internals, endpoints }, agendaUid, mergeInUid),
  await list.byAgendaUid(
    internals,
    agendaUid,
    query,
    {},
    { ...options, total: null, detailed: true }
  ),
  data,
  options
);

module.exports.bySetUid = async (
  { internals, endpoints },
  setUid,
  mergeInUid,
  query,
  data,
  options = {}
) => merge(
  { internals, endpoints },
  await get.bySetUid({ internals, endpoints }, setUid, mergeInUid),
  await list.bySetUid(
    internals,
    setUid,
    query,
    {},
    { ...options, total: null, detailed: true }
  ),
  data,
  options
);
