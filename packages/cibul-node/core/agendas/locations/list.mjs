import getAgenda from '../utils/getAgenda.mjs';
import preCleanSearchQuery from '../utils/preCleanSearchQuery.mjs';

export default (core, agendaOrUid) => async (query, nav, options = {}) => {
  const { agendaLocations } = core.services;

  const {
    useAfter = true,
    eventCounts = false,
  } = options;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.list(preCleanSearchQuery(query, { targetKey: 'uids' }), {
    ...nav,
    limit: nav?.size !== undefined ? nav.size : nav?.limit,
    offset: nav?.from !== undefined ? nav.from : nav?.offset,
    useAfter,
  }, {
    total: true,
    includeImagePath: true,
    detailed: !!query?.detailed,
    eventCounts,
    context: { agendaUid: agenda.uid },
  });
};
