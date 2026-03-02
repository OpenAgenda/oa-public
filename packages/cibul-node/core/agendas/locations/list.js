import getAgenda from '../utils/getAgenda.js';
import preCleanSearchQuery from '../utils/preCleanSearchQuery.js';
import { schemasWithEvent } from '../utils/merge.js';

export default (core, agendaOrUid) =>
  async (query, nav, options = {}) => {
    const { agendaLocations } = core.services;

    const { useAfter = true, eventCounts = false } = options;

    const detailed = !!query?.detailed;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    // Get merged form schema for location tag filtering (only needed when detailed)
    const formSchema = detailed
      ? schemasWithEvent(
        agenda?.network?.formSchema ?? null,
        agenda.formSchema,
        { access: 'public' },
      )
      : null;

    return endpoints.list(
      preCleanSearchQuery(query, { targetKey: 'uids' }),
      {
        ...nav,
        limit: nav?.size !== undefined ? nav.size : nav?.limit,
        offset: nav?.from !== undefined ? nav.from : nav?.offset,
        useAfter,
      },
      {
        total: true,
        includeImagePath: true,
        detailed,
        eventCounts,
        context: { agendaUid: agenda.uid },
        formSchema,
      },
    );
  };
