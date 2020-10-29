'use strict';

const log = require('@openagenda/logs')('remove');

const get = require('./get');
const NotFoundError = require('./lib/NotFoundError');

async function remove(service, current) {
  log('received %j payload', current.uid);

  await service.clients.knex(service.config.schema).where('uid', current.uid).del();

  return current;
}

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  identifiers,
  options = {}
) => {
  const current = await get.byAgendaUid(service, agendaUid, identifiers, options);

  if (!current) {
    throw new NotFoundError('location', { identifiers, agendaUid });
  }

  return remove(service, current);
}

module.exports.bySetUid = async (
  service,
  setUid,
  identifiers,
  options = {}
) => {
  const current = await get.bySetUid(service, setUid, identifiers, options);

  if (!current) {
    throw new NotFoundError('location', { identifiers, setUid });
  }

  return remove(service, current);
}
