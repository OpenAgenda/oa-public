'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = (core, agendaOrUid) => async (mergeInItem, query, data, options = {}) => {
  const {
    agendaLocations,
  } = core.services;

  const agenda = await getAgenda(core.services, agendaOrUid);

  const endpoints = agenda.locationSetUid ? agendaLocations.sets(agenda.locationSetUid).locations : agendaLocations(agenda.uid);

  return endpoints.merge(mergeInItem, query, data, { ...options, context: { agendaUid: agenda.uid }, agendaUid: agenda.uid });
};
