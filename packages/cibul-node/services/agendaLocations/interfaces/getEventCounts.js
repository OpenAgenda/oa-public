'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaLocations/getEventCounts');

module.exports = (config, services) => async (locationUids, { agendaUid }) => {
  log('getting for %s for agenda %s', locationUids.join(', '), agendaUid);
  const { knex, core } = services;
  const { aggregations: { locations: agendaEventCounts } } = await core.agendas(agendaUid).events.search({ locationUid: locationUids, state: null }, { size: 0 },
    { aggregations: { type: 'locations', size: locationUids.length } });

  const absoluteCounts = await knex('event_2 as e')
    .select(['e.location_uid as locationUid', knex.raw('count(e.id) as eventCount')])
    .whereIn('e.location_uid', locationUids)
    .groupBy('e.location_uid')
    .then(rows => rows.map(r => ({
      uid: r.locationUid,
      eventCount: r.eventCount
    })));

  return absoluteCounts.reduce((merged, absCount) => {
    const index = _.findIndex(merged, { uid: absCount.uid });

    if (index === -1) {
      merged.push({
        ...absCount,
        agendaEventCount: 0
      });
    } else {
      merged[index].eventCount = absCount.eventCount;
    }

    return merged;
  }, agendaEventCounts.map(e => ({ uid: e.key, agendaEventCount: e.eventCount, eventCount: 0 })));
};
