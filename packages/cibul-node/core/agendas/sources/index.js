'use strict';

const getAgenda = require('../utils/getAgenda');

const list = (core, agendaUid) => async (query, nav, options = {}) => {
  const {
    aggregators,
  } = core.services;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const resp = await aggregators.sources.list(agenda, query, nav, options);

  if (resp.sources.length >= 1 && resp.sources?.[0]?.agenda?.id) {
    resp.sources.forEach(source => {
      delete source.agenda.id;
    });
  }

  return resp;
};

module.exports = (core, agendaUid) => ({
  list: list(core, agendaUid),
});
