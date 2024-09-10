import logs from '@openagenda/logs';

import validateOptions from './lib/validateOptions.js';

const log = logs('remove');

async function _remove(service, where, current = null, params = null) {
  const { config, client, removeLegacy } = service;

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

  const result = await client('agenda_event')
    .update({ updated_at: new Date(), removed: 1 })
    .where(where);

  const success = !!result;

  if (success && config.interfaces.onRemove) {
    config.interfaces.onRemove(
      current,
      params !== null ? params.context : null,
    );
  }
  if (success && params.transferToLegacy) {
    try {
      await removeLegacy(current);
    } catch (e) {
      log.warn('legacy ref could not be removed', { error: e });
    }
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
    await get(agendaUid, eventUid),
    validateOptions(options),
  );
}

export async function byEventUid(service, eventUid, options) {
  const { client, listByEventUid, queue } = service;

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
      if (queue) {
        await queue(
          'onRemove',
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

export async function byLegacyId(service, agendaId = null, eventId = null) {
  const { client, getByLegacyId } = service;

  if (!agendaId && !eventId) {
    throw new Error('Invalid request');
  }

  if (agendaId && eventId) {
    return _remove(
      service,
      {
        legacy_id: [agendaId, eventId].join('.'),
      },
      await getByLegacyId(agendaId, eventId),
      {},
    );
  }

  const like = `%${agendaId || ''}.${eventId || ''}%`;

  const aggCountsToBeRemovedByAgendaUid = await client('agenda_event')
    .select(
      client.raw(
        'agenda_uid as agendaUid, count(event_uid) as toBeRemovedCount',
      ),
    )
    .where('legacy_id', 'like', like)
    .andWhere('aggregated', true)
    .groupBy('agendaUid');

  for (const {
    agendaUid,
    toBeRemovedCount,
  } of aggCountsToBeRemovedByAgendaUid) {
    await service.getAggregatedCount.dec(agendaUid, toBeRemovedCount);
  }

  const result = await client('agenda_event')
    .update({ updated_at: new Date(), removed: 1 })
    .where('legacy_id', 'like', like);

  return {
    success: result >= 1,
  };
}

export default Object.assign(remove, {
  byLegacyId,
  byEventUid,
});
