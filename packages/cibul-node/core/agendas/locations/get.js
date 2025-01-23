import getAgenda from '../utils/getAgenda.js';
import formatExtIds from './formatExtIds.js';

export default (core, agendaOrUid) =>
  async (identifiers, options = {}) => {
    const { agendaLocations } = core.services;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    return formatExtIds.afterRead(
      await endpoints.get(identifiers, {
        ...options,
        throwOnNotFound: true,
        includeImagePath: true,
        context: { agendaUid: agenda.uid },
      }),
    );
  };
