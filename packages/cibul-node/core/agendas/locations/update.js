'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (uid, data, options = {}) => {
  const {
    agendaLocations,
  } = core.services;

  const {
    context = {},
  } = options;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.update(uid, data, {
    geocodeIfUndefined: true,
    includeImagePath: true,
    agendaUid: agenda.uid,
    context: {
      ...context,
      agendaUid: agenda.uid,
      setUid: agenda.setUid,
    },
  });
};
