'use strict';

const { NotFound } = require('@openagenda/verror');
const log = require('@openagenda/logs')('transfer');
const get = require('./get');
const authorize = require('./lib/authorize');

async function transfer(service, current, targetAgendaUid, options = {}) {
  log('transferring location %s to agenda %s', current.uid, targetAgendaUid);

  // Authorize the transfer (using 'update' action)
  await authorize(service, 'update', current.uid, options);

  // Get target agenda details (id and locationSetUid)
  const targetAgenda = await service.interfaces.getAgendaDetailsByUid(
    targetAgendaUid,
    ['id', 'locationSetUid'],
  );

  if (!targetAgenda || !targetAgenda.id) {
    throw new NotFound(
      { info: { agendaUid: targetAgendaUid } },
      'target agenda not found',
    );
  }

  // Update database: agenda_id and set_uid
  await service.clients
    .knex(service.config.schema)
    .update({
      agenda_id: targetAgenda.id,
      set_uid: targetAgenda.locationSetUid,
      updated_at: new Date(),
    })
    .where('uid', current.uid);

  log('location %s transferred to agenda %s', current.uid, targetAgendaUid);

  // Build updated location object
  const updated = {
    ...current,
    agendaId: targetAgenda.id,
    setUid: targetAgenda.locationSetUid,
    updatedAt: new Date(),
  };

  // Call onUpdate to handle linkedEvents resync
  if (service.interfaces.onUpdate) {
    await service.interfaces.onUpdate(current, updated, options.context);
  }

  return updated;
}

// Main export - accepts identifiers
module.exports = async (
  service,
  identifiers,
  targetAgendaUid,
  options = {},
) => {
  const current = await get(
    { internals: service, endpoints: {} },
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound({ info: identifiers }, 'location not found');
  }

  return transfer(service, current, targetAgendaUid, options);
};

// byAgendaUid variant
module.exports.byAgendaUid = async (
  service,
  sourceAgendaUid,
  identifiers,
  targetAgendaUid,
  options = {},
) => {
  const current = await get.byAgendaUid(
    { internals: service, endpoints: {} },
    sourceAgendaUid,
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound(
      { info: { identifiers, agendaUid: sourceAgendaUid } },
      'location not found',
    );
  }

  return transfer(service, current, targetAgendaUid, options);
};
