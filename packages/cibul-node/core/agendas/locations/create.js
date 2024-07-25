import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) => async (data, options = {}) => {
  const { agendaLocations } = core.services;

  const { autocomplete = true } = options;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.create(data, {
    autocomplete,
    includeImagePath: true,
    agendaUid: agenda.uid,
    context: {
      userUid: options.userUid,
      agendaUid: agenda.uid,
      setUid: agenda.locationSetUid,
    },
  });
};
