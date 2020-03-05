'use strict';

module.exports = async (service, agendaUid, eventUid, paths) => {
  const ae = await service.exposed(agendaUid).get(eventUid);

  if (!ae) throw new Error('reference not found');

  return service.exposed(agendaUid).update(eventUid, {
    sourcePaths: paths
  });
}
