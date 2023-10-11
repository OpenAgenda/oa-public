'use strict';

const log = require('@openagenda/logs')('services/agendaLocations/tasks/beforeMergeEventUpdate');

module.exports = services => async function beforeMergeEventUpdate(locationsUids, mergedInLocationUid) {
  const {
    core,
    events: eventsSvc,
  } = services;

  let events = [];

  for (const locationUid of locationsUids) {
    let hasMore = true;
    let offset = 0;

    do {
      const fetchedEvents = await eventsSvc.list({
        locationUid,
      }, {
        offset,
        limit: 100,
      }, {
        includeFields: ['uid', 'agendaUid', 'locationUid'],
        private: null,
        draft: null,
      }).then(e => e);

      if (!fetchedEvents.length) {
        hasMore = false;
        continue;
      }
      events = events.concat(fetchedEvents);
      offset += 100;
    } while (hasMore);
  }

  for (const event of events) {
    try {
      log('setting location %s on event %s', mergedInLocationUid, event.uid);
      await core.agendas(event.agendaUid).events.patch(event.uid, {
        location: {
          uid: mergedInLocationUid,
        },
      }, {
        access: 'internal',
      });
    } catch (e) {
      log('error', 'failed to update event %s with location uid %s', event.uid, event.locationUid, e);
    }
  }
};
