import getAgenda from '../utils/getAgenda.js';
import { schemasWithEvent } from '../utils/merge.js';

export default (core, agendaOrUid) =>
  async (identifiers, options = {}) => {
    const { agendaLocations } = core.services;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    // Get merged form schema for location tag filtering
    const formSchema = schemasWithEvent(
      agenda?.network?.formSchema ?? null,
      agenda.formSchema,
      { access: 'public' },
    );

    return endpoints.get(identifiers, {
      ...options,
      throwOnNotFound: true,
      includeImagePath: true,
      context: { agendaUid: agenda.uid },
      formSchema,
    });
  };
