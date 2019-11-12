'use strict';

module.exports = (agendaEvents, agendaUid, eventUid) => agendaEvents.list.byEventUid(eventUid, {
  excludeAgendaUid: agendaUid,
  state: 2
}, 0, 1).then(r => !!r.items.length);
