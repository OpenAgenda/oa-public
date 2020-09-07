'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('services/agendaLocations/locationWillRemove');

module.exports = services => async location => {
  const {
    events: eventSvc
  } = services;

  log('info', 'deleting events associated with location of uid %s', location.uid);

  let hasMore = true;
  let offsetErrored = 0;

  do {
    const { events } = await eventSvc.list({
      locationUid: location.uid
    }, offsetErrored, 1, { private: null });

    if (!events.length) {
      hasMore = false;
      continue;
    }

    const uid = events[0].uid;

    try {
      log('deleting event %s', uid);

      await eventSvc.remove({ uid });
    } catch(e) {
      offsetErrored++;
      log('error', 'failed to remove event %s with location uid %s', uid, location.uid, e);
    }

  } while (hasMore);
}
