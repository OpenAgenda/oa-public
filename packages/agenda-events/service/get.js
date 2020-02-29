'use strict';

const _ = require('lodash');

const utils = require('./lib/utils');
const validate = require('../iso/validate');
const validateOptions = require('./lib/validateOptions');

module.exports = async (service, agendaUid, eventUid, options = {}) => {
  const {
    client,
    config
  } = service;

  if (!agendaUid) {
    throw new Error('Agenda uid is missing');
  }
  if (!eventUid) {
    throw new Error('Event uid is missing');
  }

  const {
    decorate
  } = validateOptions(options);

  const ae = await _get(client, {
    'agenda_uid': agendaUid,
    'event_uid': eventUid
  });

  if (decorate.includes('member') && config.interfaces.getMembers && ae) {
    ae.member = ae.userUid ? _.get(await config.interfaces.getMembers([ae]), '0') : null;
  }

  return ae;
}

module.exports.byLegacyId = async (service, agendaId, eventId) => {
  const {
    client
  } = service;

  return _get(client, {
    'legacy_id' : agendaId + '.' + eventId
  });
}

async function _get(client, where) {
  const entry = await client('agenda_event')
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
