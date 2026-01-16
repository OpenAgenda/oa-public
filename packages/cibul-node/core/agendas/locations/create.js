import getAgenda from '../utils/getAgenda.js';
import formatExtIds from './formatExtIds.js';

export default (core, agendaOrUid) =>
  async (data, options = {}) => {
    const { agendaLocations } = core.services;

    const { autocomplete = true } = options;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    return formatExtIds.afterRead(
      await endpoints.create(formatExtIds.beforeInsert(data), {
        autocomplete,
        includeImagePath: true,
        agendaUid: agenda.uid,
        context: {
          userUid: options.context?.userUid || options.userUid,
          agendaUid: agenda.uid,
          setUid: agenda.locationSetUid,
        },
      }),
    );
  };
