'use strict';

const LIMIT = 20;

const formatEventForIndex = require('./lib/formatEventForIndex');
const log = require('@openagenda/logs')('services/eventSearch/transverseIndex');

module.exports = (services, eventSearch, queue) => {
  const searchIndex = eventSearch('events');

  queue.register({
    transverseIndexRebuild: transverseIndexRebuild.bind(null, services, searchIndex),
    transverseIndexUpdate: transverseIndexUpdate.bind(null, searchIndex),
    transverseIndexRemove: transverseIndexRemove.bind(null, searchIndex)
  });

  return searchIndex.search;
}

async function transverseIndexRemove(searchIndex, eventUid) {
  log('removing event %s from transverse index', eventUid);
  return searchIndex.remove({ uid: eventUid });
}

async function transverseIndexUpdate(searchIndex, data) {
  const { uid } = data.uid;

  if (await searchIndex.search({ uid }).then(r => r.total)) {
    log('updating event %s in transverse index', uid);
    return searchIndex.update({ uid }, data, { expire: true });
  } else {
    log('adding event %s to transverse index', uid);
    return searchIndex.add(data, { expire: true });
  }
}

async function transverseIndexRebuild(services, searchIndex, options = {}) {
  const {
    events: eventsSvc
  } = services;

  const {
    createdSince,
    stopAtCount
  } = {
    createdSince: 180, // days
    stopAtCount: null,
    ...options
  }

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - createdSince);

  const initialLastId = await eventsSvc
    .list({ createdAt }, 0, 1, { internal: true })
    .then(({ events }) => events[0].id);

  log('info', `starting from event of id ${initialLastId}`, { createdSince, stopAtCount });
  let stop = false;

  return searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
      if (stop) {
        return {
          lastId: -1,
          events: []
        }
      }

      const {
        events,
        lastId: newLastId
      } = await eventsSvc.list({}, lastId === 0 ? initialLastId : lastId, limit, {
        offsetAsLastId: true,
        detailed: true,
        internal: true
      });

      return {
        lastId: newLastId,
        events: events.map(event => formatEventForIndex({ event }))
      }
    },
    on: {
      bulk: ({ lastId, counts, result }) => {
        log('info', `bulk done for ${counts.indexed} events`, lastId);
        if (stopAtCount !== null && counts.indexed > stopAtCount) {
          stop = true;
        }
      },
      error: ({ result, lastId }) => {
        log('error', 'bulk failed', { result, lastId });
      }
    }
  });
}
