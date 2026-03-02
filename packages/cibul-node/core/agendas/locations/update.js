import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) =>
  async (identifiers, data, options = {}) => {
    const { agendaLocations } = core.services;

    const { context = {}, autocomplete = true, mergeExtIds = true } = options;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    // agenda-locations now handles formatExtIds internally
    return endpoints.update(identifiers, data, {
      autocomplete,
      includeImagePath: true,
      agendaUid: agenda.uid,
      mergeExtIds,
      context: {
        ...context,
        agendaUid: agenda.uid,
        setUid: agenda.setUid,
      },
    });
  };
