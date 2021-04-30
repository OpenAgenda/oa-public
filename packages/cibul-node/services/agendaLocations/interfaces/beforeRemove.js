'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('services/agendaLocations/beforeRemove');

module.exports = services => async (location, options = {}) => {
  const {
    events: eventSvc,
    core
  } = services;
  const {
    removeEvents
  } = options;

  if (!removeEvents) {
    return;
  }
  log('info', 'deleting events associated with location of uid %s', location.uid);

  let hasMore = true;
  let offsetErrored = 0;

  do {
    const event = await eventSvc.list({
      locationUid: location.uid
    }, { offset: offsetErrored, limit: 1 }, { private: null, draft: null, includeFields: ['uid', 'agendaUid']}).then(events => events.pop());

    if (!event) {
      hasMore = false;
      continue;
    }

    try {
      log('deleting event %s', event.uid);

      await core.agendas(event.agendaUid).events.remove(event.uid);
    } catch(e) {
      offsetErrored++;
      log('error', 'failed to remove event %s with location uid %s', event.uid, location.uid, e);
    }

  } while (hasMore);
}
