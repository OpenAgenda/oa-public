'use strict';

const _ = require('lodash');

const utils = require('./lib/utils');
const validate = require('../iso/validate');
const validateOptions = require('./lib/validateOptions');

module.exports = (config, client) => Object.assign(get.bind(null, config, client), {
  byLegacyId: (agendaId, eventId) => _get(client, {
    'legacy_id' : agendaId + '.' + eventId
  })
});


async function get(config, knex, agendaUid, eventUid, options = {}) {
  if (!agendaUid) throw new Error('Agenda uid is missing');
  if (!eventUid) throw new Error('Event uid is missing');

  const {
    decorate
  } = validateOptions(options);

  const ae = await _get(knex, {
    'agenda_uid': agendaUid,
    'event_uid': eventUid
  });

  if (decorate.includes('member') && config.interfaces.getMembers && ae) {
    ae.member = ae.userUid ? _.get(await config.interfaces.getMembers([ae]), '0') : null;
  }

  return ae;
}

async function _get(knex, where) {
  const entry = await knex('agenda_event')
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
