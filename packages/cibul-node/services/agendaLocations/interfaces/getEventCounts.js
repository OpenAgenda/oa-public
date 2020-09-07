'use strict';

const _ = require('lodash');

module.exports = ({ knex }) => async (locationUids, { agendaUid }) => {
  const agendaEventCounts = await knex('event_2 as e')
    .select(['e.location_uid as locationUid', knex.raw('count(e.id) as eventCount')])
    .leftJoin('agenda_event as ae', 'e.uid', 'ae.event_uid')
    .whereIn('e.location_uid', locationUids)
    .andWhere('ae.agenda_uid', agendaUid)
    .groupBy('e.location_uid')
    .then(rows => rows.map(r => ({
      uid: r.locationUid,
      agendaEventCount: r.eventCount
    })));

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
  }, agendaEventCounts.map(pair => ({ ...pair, eventCount: 0 })));
}
