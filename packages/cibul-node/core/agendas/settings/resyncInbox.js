'use strict';

module.exports = async (services, agendaUid) => {
  const {
    agendas,
    inboxes
  } = services;

  const {
    syncAgenda: syncAgendaInbox
  } = inboxes.tasks.sync;

  const agenda = await agendas.get({ uid: agendaUid }, { private: null, internal: true });
  const stats = {};

  await syncAgendaInbox(agenda, stats);

  return stats;
}
