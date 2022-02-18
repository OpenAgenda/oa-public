'use strict';

const log = require('@openagenda/logs')('remove');
const { NotFound } = require('@openagenda/verror');
const removeCandidate = require('./duplicates/removeCandidate');

const get = require('./get');
const authorize = require('./lib/authorize');

async function remove({ endpoints, internals }, current, options = {}) {
  log('received %j payload with options %j', current.uid, options);

  await authorize(internals, 'delete', current.uid, options);

  if (internals.interfaces.beforeRemove) {
    await internals.interfaces.beforeRemove(current, options);
  }
  await internals.clients
    .knex(internals.config.schema)
    .where('uid', current.uid)
    .update({
      deleted: 1,
      updated_at: new Date(),
      merged_in: options?.mergedIn
    });
  if (current?.duplicateCandidates?.length > 0) {
    await removeCandidate(endpoints, current.duplicateCandidates, current.uid)
      .then(res => res, err => { log(err); });
  }
  return current;
}

module.exports = remove;

module.exports.byAgendaUid = async (
  { endpoints, internals },
  agendaUid,
  identifiers,
  options = {},
) => {
  const current = await get.byAgendaUid(
    { internals, endpoints },
    agendaUid,
    identifiers,
    options
  );

  if (!current) {
    throw new NotFound({ info: { identifiers, agendaUid } }, 'location not found');
  }

  return remove({ endpoints, internals }, current, options);
};

module.exports.bySetUid = async (
  { endpoints, internals },
  setUid,
  identifiers,
  options = {}
) => {
  const current = await get.bySetUid({ internals, endpoints }, setUid, identifiers, options);

  if (!current) {
    throw new NotFound({ info: { identifiers, setUid } }, 'location not found');
  }

  return remove({ endpoints, internals }, current, options);
};
