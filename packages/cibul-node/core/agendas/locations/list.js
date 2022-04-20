'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (query, nav, options = {}) => {
  const {
    agendaLocations,
  } = core.services;

  const {
    useAfter = true,
    eventCounts = false
  } = options;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.list(query, {
    ...nav,
    limit: nav?.size !== undefined ? nav.size : nav?.limit,
    offset: nav?.from !== undefined ? nav.from : nav?.offset,
    useAfter
  }, {
    total: true,
    includeImagePath: true,
    detailed: !!query?.detailed,
    eventCounts,
    context: { agendaUid: agenda.uid }
  });
};
