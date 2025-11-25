import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/eventSearch/transverseIndex');

export async function transverseIndexRemove(searchIndex, eventUid) {
  log.debug('removing event %s from transverse index', eventUid);
  try {
    return searchIndex.remove({ uid: eventUid });
  } catch (e) {
    log.warn('remove failed', { eventUid });
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

  const { refreshTransverseIndexOnUpdate = false } = config.es75;

  if (event.private) {
    log.debug('event is private, exiting', { eventUid: uid });
    tracker('transverseIndex.done');
    return;
  }

  log.debug('updating/adding event in transverse index', { eventUid: uid });
  const result = await searchIndex.update({ uid }, event, {
    operation: 'index',
    refresh: refreshTransverseIndexOnUpdate,
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
  const {
    events: eventsSvc,
    agendaEvents: agendaEventSvc,
    agendas: agendasSvc,
  } = services;

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
      log.debug('listing %s from id %s', limit, lastId);
      if (stop) {
        return {
          lastId: -1,
          events: [],
        };
      }

      const { items: events, after: newLastId } = await eventsSvc.list(
        {},
        {
          after: lastId === 0 ? initialLastId : lastId,
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

        const agendaUidsWhereIsPublished = await agendaEventSvc.list
          .byEventUid(event.uid, { state: 2 })
          .then(({ items }) => items.map(({ agendaUid }) => agendaUid));

        if (!agendaUidsWhereIsPublished.length) {
          log.debug(
            '  %s, (%s): not published anywhere, not indexing',
            event.slug,
            event.uid,
          );
          continue;
        }

        const { total: indexedAgendasReferencingEventTotal } = await agendasSvc.list({ uid: agendaUidsWhereIsPublished }, 0, 0, {
          indexed: true,
          total: true,
        });

        if (indexedAgendasReferencingEventTotal === 0) {
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
        lastId,
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
