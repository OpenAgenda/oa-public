'use strict';

const _ = require('lodash');

const legacyTransfer = require('./legacyTransfer');
const validateOptions = require('./lib/validateOptions');

let config, knex, queue;

module.exports = _.extend( remove, {
  init: ( c, k ) => {

    config = c;
    knex = k;
    queue = config.queues.interfaces;

  },
  byLegacyId,
  byEventUid
} );


module.exports = async ({ config, client, get }, agendaUid, eventUid, options = {} ) => {
  return _remove({ config, client }, {
    event_uid: eventUid,
    agenda_uid: agendaUid,
  }, await get(agendaUid, eventUid), validateOptions(options));
}


async function byEventUid({ config, client, listByEventUid }, eventUid, options) {
  let events = [], offset = 0, limit = 20;

  while ((events = (await listByEventUid(eventUid, offset, limit)).items).length) {
    events.forEach(e => queue(['onRemove', e, options ? options.context : undefined]));
    offset += limit;
  }

  const removedRows = await client('agenda-event')
    .del()
    .where({ event_uid: eventUid });

  return {
    success: removedRows >= 1,
    removed: removedRows
  }
}


async function byLegacyId( agendaId = null, eventId = null ) {

  if ( !agendaId && !eventId ) {

    throw new Error( 'Invalid request' );

  }

  if ( agendaId === null || eventId === null ) {

    let removedRows = await knex( config.schemas.agendaEvent ).del()
      .where( 'legacy_id', 'like', '%' + ( agendaId || '' ) + '.' + ( eventId || '' ) + '%' );

    return {
      success: removedRows >= 1
    }

  }

  return _remove( {
    legacy_id: [ agendaId, eventId ].join( '.' )
  }, await get.byLegacyId(  agendaId, eventId ), {} );

}


async function _remove({ config, client }, where, current = null, params = null ) {
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

  success = removedRows == 1;

  if (success && config.interfaces.onRemove) {
    config.interfaces.onRemove(current, params !== null ? params.context : null);
  }

  if (success && params.transferToLegacy) {
    await legacyTransfer.remove(current);
  }

  return {
    success,
    removed: current
  }
}
