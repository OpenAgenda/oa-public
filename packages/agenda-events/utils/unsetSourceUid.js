'use strict';

module.exports = async (endpoints, agendaUid, eventUid, sourceAgendaUid) => {
  const ae = await endpoints.get(agendaUid, eventUid);

  if (!ae) throw new Error('reference not found');

  return endpoints.update(agendaUid, eventUid, {
    sourceAgendaUid: ae.sourceAgendaUid.filter(uid => uid !== sourceAgendaUid)
  });
}
