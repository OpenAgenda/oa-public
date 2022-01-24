'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (uid, data) => {
  const {
    agendaLocations
  } = core.services;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.patch(uid, data, {
    geocodeIfUndefined: true,
    includeImagePath: true,
    agendaUid: agenda.uid
  });
};
