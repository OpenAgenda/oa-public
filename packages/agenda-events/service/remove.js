import logs from '@openagenda/logs';

import validateOptions from './lib/validateOptions.js';

const log = logs('remove');

async function _remove(service, where, current = null, params = null) {
  const { config, client } = service;

  const { soft } = params;
  log('called with soft', { soft }, current);
  if (current === null) {
    return {
      success: false,
      code: 'not_found',
    };
  }

  if (config.interfaces.beforeRemove) {
    await config.interfaces.beforeRemove(
      current,
      params !== null ? params.context : null,
    );
  }

  if (current.aggregated) {
    await service.getAggregatedCount.dec(current.agendaUid);
  }
  let result = null;

  if (soft === false) {
    log('hard remove, deleting agenda-event', { where });
    result = await client('agenda_event').del().where(where);
  } else {
    result = await client('agenda_event')
      .update({ updated_at: new Date(), removed: 1 })
      .where(where);
  }

  const success = !!result;

  if (success && config.interfaces.onRemove) {
    config.interfaces.onRemove(
      current,
      params !== null ? params.context : null,
    );
  }

  log('debug', 'returning', { success, removed: current });
  return {
    success,
    removed: current,
  };
}

async function remove(service, agendaUid, eventUid, options = {}) {
  const { get } = service;
  return _remove(
    service,
    {
      event_uid: eventUid,
      agenda_uid: agendaUid,
    },
    await get(agendaUid, eventUid, { removed: null }),
    validateOptions(options, 'remove'),
  );
}

export async function byEventUid(service, eventUid, options) {
  const { config, client, listByEventUid } = service;

  let aesToBeRemoved = [];
  let offset = 0;
  const limit = 20;

  while (
    (aesToBeRemoved = (await listByEventUid(eventUid, offset, limit)).items)
      .length
  ) {
    for (const aeToBeRemoved of aesToBeRemoved) {
      if (aeToBeRemoved.aggregated) {
        await service.getAggregatedCount.dec(aeToBeRemoved.agendaUid);
      }
      if (config.interfaces.onRemove) {
        config.interfaces.onRemove(
          aeToBeRemoved,
          options ? options.context : undefined,
        );
      }
    }
    offset += limit;
  }

  const result = await client('agenda_event')
    .update({ updated_at: new Date(), removed: 1 })
    .where({ event_uid: eventUid });

  return {
    success: result >= 1,
    removed: result,
  };
}

export default Object.assign(remove, {
  byEventUid,
});
