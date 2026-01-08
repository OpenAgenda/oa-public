import _ from 'lodash';
import logs from '@openagenda/logs';

import validate from '../iso/validate.js';
import validateOptions from './lib/validateOptions.js';
import * as utils from './lib/utils.js';

const log = logs('create');

export default async (
  service,
  agendaUid,
  eventUid,
  data = {},
  options = {},
) => {
  const { config, client, get } = service;

  log('info', 'initiating create', { agendaUid, eventUid, data, options });

  const params = validateOptions(options, 'create');

  let clean;
  let success = false;
  let created = null;

  try {
    const values = {
      eventUid,
      agendaUid,
      ..._.omit(data, ['aggregated']) || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!params.protected) {
      ['updatedAt', 'createdAt', 'aggregated'].forEach((f) => {
        if (data[f]) values[f] = data[f];
      });
    }

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

  if (clean.userUid && clean.aggregated) {
    return {
      success: false,
      valid: false,
      errors: [
        {
          field: 'aggregated',
          code: 'invalid',
          message: 'cannot be aggregated and associated to a user',
          origin: _.pick(clean, ['userUid', 'aggregated']),
        },
      ],
    };
  }

  if (await get(agendaUid, eventUid)) {
    return {
      success: false,
      valid: true,
      code: 'already.exists',
    };
  }

  const insertIds = await client('agenda_event').insert(utils.toEntry(clean));

  success = insertIds.length === 1;

  if (success) {
    created = await get(clean.agendaUid, clean.eventUid, params);

    // remove any other reference that was there for the same agenda / event pair
    await client('agenda_event')
      .delete()
      .where({
        agenda_uid: agendaUid,
        event_uid: eventUid,
        removed: 1,
      })
      .where('id', '<', insertIds[0]);
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
    created,
  };
};
