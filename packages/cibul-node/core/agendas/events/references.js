'use strict';

const { NotFound, Forbidden } = require('@openagenda/verror');

module.exports = async (core, agendaUid, eventUid, query = {}, options = {}) => {
  const {
    agendaEvents,
    agendas,
    members,
  } = core.services;

  const {
    excludeCurrentAgenda = true,
  } = query;

  const agenda = await core.agendas(agendaUid).get({
    access: 'internal',
    private: null,
    useCache: true,
  });

  if (!agenda) {
    throw new NotFound({
      info: { uid: agendaUid },
    }, 'agenda not found');
  }

  const member = options.userUid ? await members.get({
    agendaUid,
    userUid: options.userUid,
  }) : null;

  if (!member && agenda.private) {
    throw new Forbidden('not authorized to read event references');
  }

  const {
    items: references,
  } = await agendaEvents.list.byEventUid(
    eventUid,
    { state: 2, private: false, excludeAgendaUid: excludeCurrentAgenda ? agendaUid : null },
    0,
    10,
  );

  const result = await agendas.list({
    uid: references.map(r => r.agendaUid),
  }, 0, references.length);

  return result.agendas;
};
