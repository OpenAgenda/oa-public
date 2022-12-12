'use strict';

const logs = require('@openagenda/logs');

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => {
  const log = logs('core/agendas/locations/patch');
  return async function patchLocation(uid, data) {
    const {
      agendaLocations,
    } = core.services;

    const agenda = await getAgenda(core.services, agendaOrUid);

    const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

    try {
      const result = await endpoints.patch(uid, data, {
        geocodeIfUndefined: true,
        includeImagePath: true,
        agendaUid: agenda.uid,
      });

      return result;
    } catch (e) {
      log('error', 'failed to patch location: %j', e.info);
      throw new Error(e);
    }
  };
};
