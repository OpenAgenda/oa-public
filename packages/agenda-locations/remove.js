'use strict';

const log = require('@openagenda/logs')('remove');
const NotFoundError = require('@openagenda/utils/errors/NotFoundError');

const get = require('./get');
const authorize = require('./lib/authorize');

async function remove(service, current, options = {}) {
  log('received %j payload with options %j', current.uid, options);

  await authorize(service, 'delete', current.uid, options);

  if (service.interfaces.beforeRemove) {
    await service.interfaces.beforeRemove(current, options);
  }

  await service.clients
    .knex(service.config.schema)
    .where('uid', current.uid)
    .update({
      deleted: 1,
      updated_at: new Date(),
    });

  return current;
}

module.exports = remove;

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  identifiers,
  options = {},
) => {
  const current = await get.byAgendaUid(
    service,
    agendaUid,
    identifiers,
    options
  );

  if (!current) {
    throw new NotFoundError('location', { identifiers, agendaUid });
  }

  return remove(service, current, options);
};

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

  return remove(service, current, options);
};
