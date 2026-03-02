import { BadRequest } from '@openagenda/verror';

import getAgenda from '../utils/getAgenda.js';

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
      // Extract the actual value from the identifier object
      const extIdValue = typeof identifiers.extId === 'object'
        ? identifiers.extId.value
        : identifiers.extId;

      return core.agendas(agenda).locations.create(
        {
          ...data,
          extIds: [{ key: 'default', value: extIdValue }], // Pass as extIds array (validate allows this field)
        },
        options,
      );
    }

    // agenda-locations now handles formatExtIds internally
    return core.agendas(agenda).locations.update(identifiers, data, options);
  };
