'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (data, options = {}) => {
  const {
    agendaLocations,
  } = core.services;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.create(data, {
    geocodeIfUndefined: true,
    includeImagePath: true,
    agendaUid: agenda.uid,
    context: {
      userUid: options.userUid,
      agendaUid: agenda.uid,
      setUid: agenda.locationSetUid,
    },
  });
};
