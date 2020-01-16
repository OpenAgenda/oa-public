'use strict';

module.exports = async (services, agendaUid) => {
  const {
    formSchemas,
    agendas
  } = services;

  const agenda = await agendas.get({
    uid: agendaUid
  }, {
    private: null,
    internal: true
  });

  if (!agenda) {
    throw new Error('Agenda not found');
  }

  return formSchemas.legacy.transfer(agenda.id);
}
