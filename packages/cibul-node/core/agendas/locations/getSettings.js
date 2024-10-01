import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) =>
  async function getSettings(options = {}) {
    const { agendaLocations } = core.services;

    const { lang, includeSetInfo } = options;
    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid)
      : agendaLocations(agenda.uid);
    return endpoints.settings.get({
      lang,
      agendaUid: agenda.uid,
      includeSetInfo,
    });
  };
