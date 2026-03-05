import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) =>
  async (identifiers, targetAgendaUid, options = {}) => {
    const { agendaLocations } = core.services;

    const { context = {} } = options;

    const agenda = await getAgenda(core.services, agendaOrUid);

    // Always use agenda endpoint for transfer (no set handling)
    const endpoints = agendaLocations(agenda.uid);

    return endpoints.transfer(identifiers, targetAgendaUid, {
      ...options,
      agendaUid: agenda.uid,
      context: {
        ...context,
        agendaUid: agenda.uid,
      },
    });
  };
