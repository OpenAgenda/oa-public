'use strict';

module.exports = async (endpoints, agendaUid, eventUid, paths) => {
  const ae = await endpoints.get(agendaUid, eventUid);

  if (!ae) throw new Error('reference not found');

  return endpoints.update(agendaUid, eventUid, {
    sourcePaths: paths
  });
}
