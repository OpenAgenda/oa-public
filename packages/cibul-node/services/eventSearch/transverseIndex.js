'use strict';

const log = require('@openagenda/logs')('services/eventSearch/transverseIndex');
const formatEventForIndex = require('./lib/formatEventForIndex');
const LIMIT = 20;

module.exports =  (services, eventSearch) => {
  const searchIndex = eventSearch('events');

  return {
    rebuild: rebuild.bind(null, services, searchIndex)
  }
}

async function rebuild(services, searchIndex) {
  const {
    events: eventsSvc
  } = services;

  log('rebuild transverse index');
  let hasMore = true, lastId = 0;

  return searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
      const {
        events,
        lastId: newLastId
      } = await eventsSvc.list({}, lastId, limit, {
        offsetAsLastId: true,
        detailed: true,
        internal: true
      });
      lastId = newLastId;
      hasMore = events.length;

      log('fetched %s events from lastId %s', events.length, lastId);

      return {
        lastId: newLastId,
        events: events.map(event => formatEventForIndex({ event }))
      }
    }
  })
}
