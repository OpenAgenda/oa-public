'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaLocations/getEventCounts');

module.exports = (config, services) => async (locationUids, { agendaUid }) => {
  log('getting for %s for agenda %s', locationUids.join(', '), agendaUid);
  if (!locationUids.length) return [];
  const { core, events } = services;

  const absoluteCounts = await events.countByLocationUids({ locationUid: locationUids });

  const {
    aggregations: {
      locations: agendaEventCounts
    }
  } = await core.agendas(agendaUid).events.search({
    locationUid: locationUids,
    state: null
  }, {
    size: 0
  }, {
    aggregations: {
      type: 'locations',
      size: locationUids.length
    }
  });

  return absoluteCounts.reduce((merged, absCount) => {
    const index = _.findIndex(merged, { uid: absCount.locationUid });

    if (index === -1) {
      merged.push({
        uid: absCount.locationUid,
        eventCount: absCount.count,
        agendaEventCount: 0
      });
    } else {
      merged[index].eventCount = absCount.count;
    }

    return merged;
  }, agendaEventCounts.map(e => ({ uid: e.key, eventCount: 0, agendaEventCount: e.eventCount })));
};
