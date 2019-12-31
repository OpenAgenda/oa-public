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

  return () => {};
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

async function transverseIndexRebuild(services, searchIndex) {
  const {
    events: eventsSvc
  } = services;

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - 180);

  const initialLastId = await eventsSvc
    .list({ createdAt }, 0, 1, { internal: true })
    .then(({ events }) => events[0].id);

  log('info', `starting from event of id ${initialLastId}`);

  return searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
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
      },
      error: ({ result, lastId }) => {
        log('error', 'bulk failed', { result, lastId });
      }
    }
  });
}
