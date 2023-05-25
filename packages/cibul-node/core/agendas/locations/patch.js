'use strict';

const log = require('@openagenda/logs')('core/agendas/locations/patch');

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async function patchLocation(uid, data) {
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
