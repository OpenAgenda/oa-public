import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/eventSearch/transverseIndex');

async function isEventPublishedOnAnIndexedAgenda(
  services,
  event,
  options = {},
) {
  const { excludeAgenda } = options;

  const { agendaEvents: agendaEventSvc, agendas: agendasSvc } = services;

  // Origin agenda's transverse flag gates inclusion. A shared agenda flipping
  // its own flag must not affect events whose origin is a different agenda.
  const originAgenda = await agendasSvc.get(
    { uid: event.agendaUid },
    { internal: true, private: null },
  );
  if (originAgenda?.settings?.index?.transverse === false) {
    return false;
  }

  const agendaUidsWhereIsPublished = await agendaEventSvc.list
    .byEventUid(event.uid, {
      state: 2,
      ...excludeAgenda ? { excludeAgendaUid: excludeAgenda.uid } : undefined,
    })
    .then(({ items }) => items.map(({ agendaUid }) => agendaUid));

  if (!agendaUidsWhereIsPublished.length) {
    return false;
  }

  const { total: indexedAgendasReferencingEventTotal } = await agendasSvc.list(
    {
      uid: agendaUidsWhereIsPublished,
    },
    0,
    0,
    {
      indexed: true,
      total: true,
    },
  );

  return !!indexedAgendasReferencingEventTotal;
}

export async function transverseIndexRemove(
  config,
  services,
  searchIndex,
  eventUid,
) {
  const { tracker } = services;
  log.debug('removing event %s from transverse index', eventUid);
  try {
    const result = await searchIndex.remove(
      { uid: eventUid },
      {
        refresh: !!config.es75.refreshTransverseIndex?.onRemove,
      },
    );
    tracker(`transverseIndexRemove.${eventUid}.done`);
    return result;
  } catch (e) {
    log.warn('remove failed', { eventUid });
  }
}

export async function transverseUpdateEvaluateUpdateEnqueue(
  services,
  queue,
  agenda,
  event,
) {
  const { tracker } = services;
  if (event.private) {
    tracker(`eventSearch.update:${agenda.uid}.${event.uid}:noTransverse`);
    return;
  }

  const isOriginAgenda = agenda.uid === event.agendaUid;

  if (isOriginAgenda && agenda.settings?.index?.transverse === false) {
    await queue.add('transverseIndexRemove', event.uid);
  } else if (isOriginAgenda && agenda.indexed && event.state === 2) {
    await queue.add('transverseIndexUpdate', event);
  } else if (
    await isEventPublishedOnAnIndexedAgenda(services, event, {
      excludeAgenda: agenda,
    })
  ) {
    await queue.add('transverseIndexUpdate', event);
  } else {
    await queue.add('transverseIndexRemove', event.uid);
  }
}

export async function transverseIndexUpdate(
  config,
  services,
  searchIndex,
  event,
) {
  const { uid } = event;
  const { tracker } = services;

  const { refreshTransverseIndex } = config.es75;

  if (event.private) {
    log.debug('event is private, exiting', { eventUid: uid });
    tracker('transverseIndex.done');
    return;
  }

  log.debug('updating/adding event in transverse index', { eventUid: uid });
  const result = await searchIndex.update({ uid }, event, {
    operation: 'index',
    refresh: !!refreshTransverseIndex?.onUpdate,
  });
  log.debug('updated/added event in transverse index', {
    eventUid: uid,
    result,
  });

  tracker('transverseIndex.done');
}

export async function transverseIndexRebuild(
  services,
  searchIndex,
  options = {},
) {
  const { events: eventsSvc } = services;

  const { createdSince, stopAtCount } = {
    createdSince: 180, // days
    stopAtCount: null,
    ...options,
  };

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - createdSince);

  const initialLastId = await eventsSvc
    .list(
      { createdAt: { gte: createdAt } },
      { limit: 1 },
      { access: 'internal' },
    )
    .then((events) => events[0]?.id ?? -1);

  log.info(`starting from event of id ${initialLastId}`, {
    createdSince,
    stopAtCount,
  });
  let stop = false;

  const rebuildResult = await searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
      const after = lastId === 0 ? initialLastId : lastId;
      log.info('listing %s from id %s', limit, after);
      if (stop) {
        return {
          lastId: -1,
          events: [],
        };
      }

      const { items: events, after: newLastId } = await eventsSvc.list(
        {},
        {
          after,
          limit,
        },
        {
          useAfter: true,
          detailed: true,
          access: 'internal',
        },
      );

      const eventsToBeIndexed = [];

      for (const event of events) {
        if (event.private) {
          log.debug('  %s, (%s): private, not indexing', event.slug, event.uid);
          continue;
        }

        if (!await isEventPublishedOnAnIndexedAgenda(services, event)) {
          log.debug(
            '  %s, (%s): not published on any indexed agenda, not indexing',
            event.slug,
            event.uid,
          );
          continue;
        }

        eventsToBeIndexed.push(
          _.omit(
            {
              ...event,
              state: 2,
              originAgenda: event.agenda,
            },
            ['agenda'],
          ),
        );
      }

      log.debug(
        'reindexing %s events in transverse index (%s)',
        eventsToBeIndexed.length,
        after,
      );

      return {
        lastId: newLastId === null ? -1 : newLastId,
        events: eventsToBeIndexed,
      };
    },
    on: {
      bulk: ({ lastId, counts }) => {
        log.info(`bulk done for ${counts.indexed} events`, lastId);
        if (stopAtCount !== null && counts.indexed > stopAtCount) {
          stop = true;
        }
      },
      error: ({ result, lastId }) => {
        log.error('bulk failed', { result, lastId });
      },
    },
  });

  log.info('done', rebuildResult);

  return rebuildResult;
}
