import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.js';
import formatExtIds from './formatExtIds.js';

const log = logs('core/agendas/locations/patch');

export default (core, agendaOrUid) =>
  async function patchLocation(identifiers, data, options = {}) {
    const { agendaLocations } = core.services;

    const { context = {}, autocomplete = true, mergeExtIds = true } = options;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    try {
      const result = formatExtIds.afterRead(
        await endpoints.patch(identifiers, formatExtIds.beforeInsert(data), {
          autocomplete,
          mergeExtIds,
          includeImagePath: true,
          agendaUid: agenda.uid,
          context: {
            ...context,
            agendaUid: agenda.uid,
            setUid: agenda.setUid,
          },
        }),
      );

      return result;
    } catch (e) {
      log('info', 'failed to patch location: %j', e.info);
      throw e;
    }
  };
