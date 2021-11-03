'use strict';

module.exports = async (services, agendaUid) => {
  const {
    custom,
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

  if (!agenda.formSchemaId && !agenda.networkUid) {
    return null;
  }

  return custom.enqueueLegacyDatasetToCustom(agenda.id);
};
