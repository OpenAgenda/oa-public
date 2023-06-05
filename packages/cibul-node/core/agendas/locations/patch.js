'use strict';

const log = require('@openagenda/logs')('core/agendas/locations/patch');

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async function patchLocation(uid, data, options = {}) {
  const {
    agendaLocations,
  } = core.services;

  const {
    context = {},
  } = options;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  try {
    const result = await endpoints.patch(uid, data, {
      geocodeIfUndefined: true,
      includeImagePath: true,
      agendaUid: agenda.uid,
      context: {
        ...context,
        agendaUid: agenda.uid,
        setUid: agenda.setUid,
      },
    });

    return result;
  } catch (e) {
    log('error', 'failed to patch location: %j', e.info);
    throw new Error(e);
  }
};
