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
      const { events } = await eventSvc.list({
        locationUid
      }, offsetErrored, 1, { private: null });

      if (!events.length) {
        hasMore = false;
        continue;
      }

      const uid = events[0].uid;

      try {
        log('setting location %s on event %s', mergeInLocation.uid, uid);
        await eventSvc.update({ uid }, {
          locationUid: mergeInLocation.uid
        }, { transferToLegacy: true } );
      } catch(e) {
        offsetErrored++;
        log('error', 'failed to update event %s with location uid %s', uid, locationUid, e);
      }

    } while (hasMore);

  }
}
