'use strict';

const _ = require('lodash');

const utils = require('./lib/utils');
const validate = require('../iso/validate');
const validateOptions = require('./lib/validateOptions');

let config, knex;

module.exports = _.extend( get, {
  init: ( c, k ) => { config = c; knex = k },
  byLegacyId
} );

async function get(agendaUid, eventUid, options = {}) {
  if (!agendaUid) throw new Error('Agenda uid is missing');
  if (!eventUid) throw new Error('Event uid is missing');

  const {
    decorate
  } = validateOptions(options);

  const ae = await _get( {
    'agenda_uid' : agendaUid,
    'event_uid' : eventUid
  } );

  if (decorate.includes('member') && config.interfaces.getMembers) {
    ae.member = ae.userUid ? _.get( await config.interfaces.getMembers([ae]), '0') : null;
  }

  return ae;

}

async function byLegacyId( agendaId, eventId ) {

  return await _get( {
    'legacy_id' : agendaId + '.' + eventId
  } );

}

async function _get( where ) {
  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  const entry = await knex(config.schemas.agendaEvent)
    .first([
      'agenda_uid',
      'event_uid',
      'user_uid',
      'source_agenda_uid',
      'state',
      'can_edit',
      'featured',
      'aggregated',
      'created_at',
      'updated_at',
      'legacy_id'
    ]).where(where);

  if (!entry) return null;

  return validate(utils.fromEntry(entry));
}
