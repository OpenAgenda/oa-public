'use strict';

module.exports = async function getAgendaReferences(services, eventUid, { excludeAgendaUid }) {
  const {
    agendaEvents,
    agendas
  } = services;

  const {
    items: references
  } = await agendaEvents.list.byEventUid(eventUid, { excludeAgendaUid }, 0, 10);

  const result = await agendas.list({
    uid: references.map(r => r.agendaUid)
  }, 0, references.length, {
    includeImagePath: true,
    useDefaultImage: true
  });

  return result.agendas;
};
