'use strict';

const _ = require('lodash');

const validateOptions = require('./lib/validateOptions');

module.exports = async (service, agendaUid, eventUid, options = {}) => {
  const {
    get
  } = service;
  return _remove(service, {
    event_uid: eventUid,
    agenda_uid: agendaUid,
  }, await get(agendaUid, eventUid), validateOptions(options));
}

module.exports.byEventUid = async (service, eventUid, options) => {
  const { config, client, listByEventUid, queue } = service;

  let events = [], offset = 0, limit = 20;

  while ((events = (await listByEventUid(eventUid, offset, limit)).items).length) {
    events.forEach(e => queue(['onRemove', e, options ? options.context : undefined]));
    offset += limit;
  }

  const removedRows = await client('agenda_event')
    .del()
    .where({ event_uid: eventUid });

  return {
    success: removedRows >= 1,
    removed: removedRows
  }
}

module.exports.byLegacyId = async (service, agendaId = null, eventId = null) => {
  const { client, getByLegacyId } = service;

  if (!agendaId && !eventId) {
    throw new Error('Invalid request');
  }

  if (agendaId && eventId) {
    return _remove(service, {
      legacy_id: [agendaId, eventId].join('.')
    }, await getByLegacyId(agendaId, eventId), {});
  }

  const removedRows = await client('agenda_event').del()
    .where('legacy_id', 'like', '%' + (agendaId || '') + '.' + (eventId || '') + '%');

  return {
    success: removedRows >= 1
  }
}


async function _remove(service, where, current = null, params = null ) {
  const {
    config,
    client,
    removeLegacy
  } = service;

  if (current === null) {
    return {
      success: false,
      code: 'not_found'
    }
  }

  if (config.interfaces.beforeRemove ){
    await config.interfaces.beforeRemove(current, params !== null ? params.context : null);
  }

  const removedRows = await client('agenda_event')
    .del()
    .where(where);

  const success = removedRows == 1;

  if (success && config.interfaces.onRemove) {
    config.interfaces.onRemove(current, params !== null ? params.context : null);
  }

  if (success && params.transferToLegacy) {
    await removeLegacy(current);
  }

  return {
    success,
    removed: current
  }
}
