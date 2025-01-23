import { BadRequest } from '@openagenda/verror';

import getAgenda from '../utils/getAgenda.js';
import formatExtIds from './formatExtIds.js';

export default (core, agendaOrUid) =>
  async (identifiers, data, options = {}) => {
    const { agendaLocations } = core.services;

    const agenda = await getAgenda(core.services, agendaOrUid);

    if (!identifiers?.extId) {
      throw new BadRequest('extId identifier is required for set');
    }

    const endpoints = agenda.locationSetUid
      ? agendaLocations.sets(agenda.locationSetUid).locations
      : agendaLocations(agenda.uid);

    const location = await endpoints.get(identifiers, {
      throwOnNotFound: false,
      context: { agendaUid: agenda.uid },
    });

    if (!location) {
      return core.agendas(agenda).locations.create(
        {
          ...data,
          extIds: identifiers.extId,
        },
        options,
      );
    }

    return formatExtIds.afterRead(
      await core.agendas(agenda).locations.update(identifiers, data, options),
    );
  };
