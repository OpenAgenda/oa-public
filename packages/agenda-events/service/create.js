'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('create');

const validate = require('../iso/validate');
const validateOptions = require('./lib/validateOptions');
const utils = require('./lib/utils');

module.exports = async (service, agendaUid, eventUid, data = {}, options = {}) => {
  const {
    config,
    client,
    get,
    toLegacy
  } = service;

  log('info', 'initiating create', { agendaUid, eventUid, data, options });

  const params = validateOptions(options, 'create');

  let clean;
  let success = false;
  let created = null;

  try {
    const values = Object.assign({ eventUid, agendaUid }, data || {}, {
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (!params.protected) {
      ['updatedAt', 'createdAt'].forEach(f => {
        if (data[f]) values[f] = data[f];
      });
    }

    clean = validate(values);
  } catch (validationErrors) {
    return {
      success: false,
      valid: false,
      errors: validationErrors
    }
  }

  if (clean.userUid && clean.aggregated) {
    return {
      success: false,
      valid: false,
      errors: [{
        field: 'aggregated',
        code: 'invalid',
        message: 'cannot be aggregated and associated to a user',
        origin: _.pick(clean, ['userUid', 'aggregated'])
      }]
    }
  }

  if (await get(agendaUid, eventUid)) {
    return {
      success: false,
      valid: true,
      code: 'already.exists'
    }
  }

  const insertIds = await client('agenda_event')
    .insert(utils.toEntry(clean));

  success = insertIds.length === 1;

  if (success) {
    created = await get(clean.agendaUid, clean.eventUid, params);
  }

  if (success && options.transferToLegacy) {
    log('info', 'transfering to legacy %j', created);

    try {
     const updatedRef = await toLegacy(created);
     log('info', 'successfully transferred to legacy', updatedRef);
     created.legacyId = updatedRef.legacyId;
    } catch (e) {
      log('error', 'failed to transfer to legacy', e);
    }
  }

  if (success && clean.aggregated) {
    await service.getAggregatedCount.inc(clean.agendaUid);
  }

  if (success && config.interfaces.onCreate) {
    config.interfaces.onCreate(created, params.context);
  }

  log('info', 'done', { success, created, insertIds });

  return {
    success,
    insertId: insertIds.length ? insertIds[0] : null,
    created
  }
}
