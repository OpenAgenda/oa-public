'use strict';

const {
  syncAgenda: syncAgendaInbox
} = require('@openagenda/inboxes/dist/tasks/sync');

module.exports = async (services, agendaUid) => {
  const {
    agendas
  } = services;

  const agenda = await agendas.get({ uid: agendaUid }, { private: null, internal: true });
  const stats = {};

  await syncAgendaInbox(agenda, stats);

  return stats;
}
