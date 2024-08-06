import _ from 'lodash';
import logs from '@openagenda/logs';

import validate from '../iso/validate.js';
import validateOptions from './lib/validateOptions.js';
import * as utils from './lib/utils.js';

const log = logs('update');

export default async (service, agendaUid, eventUid, data, options = {}) => {
  const { config, client, get, toLegacy } = service;

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
      code: 'not_found',
    };
  }

  try {
    const values = {
      ...current,
      ...(_.omit(data, ['aggregated']) || {}),
      updatedAt: new Date(),
      createdAt: current.createdAt,
      userUid: current.userUid,
    };

    if (!params.protected) {
      ['updatedAt', 'createdAt', 'userUid', 'aggregated'].forEach((f) => {
        if (data[f]) values[f] = data[f];
      });
    }

    log('info', 'validating for %s.%s', agendaUid, eventUid, values);

    clean = validate(values);

    if (params.aggregated) {
      clean.aggregated = params.aggregated;
    }
  } catch (validationErrors) {
    return {
      success: false,
      valid: false,
      errors: validationErrors,
    };
  }

  const entry = utils.toEntry(_.omit(clean, ['agendaUid', 'eventUid']));

  log('db entry for %s.%s', agendaUid, eventUid, entry);

  const result = await client('agenda_event').update(entry).where({
    agenda_uid: agendaUid,
    event_uid: eventUid,
  });

  success = !!result;

  if (success) {
    updated = await get(clean.agendaUid, clean.eventUid, params);

    log('updated %s.%s', agendaUid, eventUid, updated);
  }

  if (success && params.transferToLegacy) {
    try {
      await toLegacy(updated);
    } catch (e) {
      log('error', 'failed this', e);
    }
  }

  if (success && config.interfaces.onUpdate) {
    config.interfaces.onUpdate(current, updated, params.context);
  }

  return {
    success,
    before: current,
    updated,
  };
};
