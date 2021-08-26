'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (query, nav) => {
  const {
    agendaLocations,
  } = core.services;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.list(query, {
    ...nav,
    useAfter: true
  }, {
    total: true,
    includeImagePath: true,
    detailed: !!query?.detailed
  });
};
