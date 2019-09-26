'use strict';

const _ = require('lodash');

// this will be slower for bigger sets
// keep it fast with a last id nav on agendaEvents
module.exports = async(agendaUid, query, nav, options = {}) => {
  const { items: agendaEvents } = await agendaEvents(agendaUid).list(query, nav.offset, nav.limit);

  const eventUids = agendaEvents.map(ae => ae.eventUid);

  const eventUids

}
