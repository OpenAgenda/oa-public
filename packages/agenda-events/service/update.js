'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('update');

const legacyTransfer = require('./legacyTransfer');
const validate = require('../iso/validate');
const validateOptions = require('./lib/validateOptions');
const utils = require('./lib/utils');

module.exports = async ({ config, client, get }, agendaUid, eventUid, data, options = {}) => {

  log('input for %s.%s', agendaUid, eventUid, data);

  const params = validateOptions(options, 'update');

  const current = await get(agendaUid, eventUid, params);

  log('current for %s.%s', agendaUid, eventUid, current);

  let clean;

  let success = false;

  let updated = null;

  if (current === null) {
    return {
      success,
      code: 'not_found'
    }
  }

  try {
    const values = Object.assign( {}, current, data || {}, {
      updatedAt: new Date(),
      createdAt: current.createdAt,
      userUid: current.userUid
    } );

    if (!params.protected) {
      ['updatedAt', 'createdAt', 'userUid'].forEach( f => {
        if ( data[ f ] ) values[ f ] = data[ f ];
      } );
    }

    log( 'info', 'validating for %s.%s', agendaUid, eventUid, values );

    clean = _.omit(validate(values), ['aggregated']);
  } catch (validationErrors) {
    return {
      success: false,
      valid: false,
      errors: validationErrors
    }
  }

  const entry = utils.toEntry(_.omit(clean, ['agendaUid', 'eventUid']));

  log('db entry for %s.%s', agendaUid, eventUid, entry);

  const result = await client(config.schemas.agendaEvent)
    .update(entry)
    .where({
      agenda_uid: agendaUid,
      event_uid: eventUid
    });

  success = !!result;

  if (success) {
    updated = await get(clean.agendaUid, clean.eventUid, params);

    log('updated %s.%s', agendaUid, eventUid, updated);
  }

  if (success && params.transferToLegacy) {
    await legacyTransfer.to(updated);
  }

  if (success && config.interfaces.onUpdate) {
    config.interfaces.onUpdate(current, updated, params.context);
  }

  return {
    success,
    before: current,
    updated
  }
}
