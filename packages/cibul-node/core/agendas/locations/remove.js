import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) =>
  async (uid, options = {}) => {
    const { agendaLocations } = core.services;

    const { context = {}, removeEvents = false } = options;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    return endpoints.remove(uid, {
      removeEvents: !!removeEvents,
      agendaUid: agenda.uid,
      context: {
        ...context,
        agendaUid: agenda.uid,
        setUid: agenda.setUid,
      },
    });
  };
