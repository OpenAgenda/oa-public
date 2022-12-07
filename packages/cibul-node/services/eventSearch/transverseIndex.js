'use strict';

const log = require('@openagenda/logs')('services/eventSearch/transverseIndex');

async function transverseIndexRemove(searchIndex, eventUid) {
  log('removing event %s from transverse index', eventUid);
  return searchIndex.remove({ uid: eventUid });
}

async function transverseIndexUpdate(searchIndex, event) {
  const { uid } = event;

  if (await searchIndex.search({ uid }).then(r => r.total)) {
    log('updating event %s in transverse index', uid);
    return searchIndex.update({ uid }, event, { operation: 'index' });
  }

  log('adding event %s to transverse index', uid);
  return searchIndex.add(event);
}

async function transverseIndexRebuild(services, searchIndex, options = {}) {
  const {
    events: eventsSvc,
  } = services;

  const {
    createdSince,
    stopAtCount,
  } = {
    createdSince: 180, // days
    stopAtCount: null,
    ...options,
  };

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - createdSince);

  const initialLastId = await eventsSvc
    .list({ createdAt: { gte: createdAt } }, { limit: 1 }, { access: 'internal' })
    .then(events => events[0].id);

  log('info', `starting from event of id ${initialLastId}`, { createdSince, stopAtCount });
  let stop = false;

  return searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
      if (stop) {
        return {
          lastId: -1,
          events: [],
        };
      }

      const {
        items: events,
        after: newLastId,
      } = await eventsSvc.list({}, {
        after: lastId === 0 ? initialLastId : lastId,
        limit,
      }, {
        useAfter: true,
        detailed: true,
        access: 'internal',
      });

      log('listed %s events for reindexing in transverse index (%s)', events.length, lastId);

      return {
        lastId: newLastId === null ? -1 : newLastId,
        events,
      };
    },
    on: {
      bulk: ({ lastId, counts }) => {
        log('info', `bulk done for ${counts.indexed} events`, lastId);
        if (stopAtCount !== null && counts.indexed > stopAtCount) {
          stop = true;
        }
      },
      error: ({ result, lastId }) => {
        log('error', 'bulk failed', { result, lastId });
      },
    },
  });
}

module.exports = (services, eventSearch, queue) => {
  const searchIndex = eventSearch('events');

  queue.register({
    transverseIndexRebuild: transverseIndexRebuild.bind(null, services, searchIndex),
    transverseIndexUpdate: transverseIndexUpdate.bind(null, searchIndex),
    transverseIndexRemove: transverseIndexRemove.bind(null, searchIndex),
  });

  return searchIndex.search;
};
