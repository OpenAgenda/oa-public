'use strict';

const log = require('@openagenda/logs')('services/agendaLocations/locationsWillMerge');

module.exports = services => async (mergeInLocation, locations) => {
  const {
    events: eventSvc
  } = services;

  log('info', 'processing event updates for merging of locations %j into %s', locations.map( l => l.uid ), mergeInLocation.uid);

  for (const locationUid of locations.map(l => l.uid)) {

    let hasMore = true;
    let offsetErrored = 0;

    do {
      const event = await eventSvc.list({
        locationUid
      }, { offset: offsetErrored, limit: 1 }, { private: null, draft: null }).then(events => events.pop());
  
      if (!event) {
        hasMore = false;
        continue;
      }
      
      try {
        log('setting location %s on event %s', mergeInLocation.uid, event.uid);
        await eventSvc.patch(event.uid, {
          locationUid: mergeInLocation.uid
        });
      } catch(e) {
        offsetErrored++;
        log('error', 'failed to update event %s with location uid %s', event.uid, locationUid, e);
      }

    } while (hasMore);

  }
}
