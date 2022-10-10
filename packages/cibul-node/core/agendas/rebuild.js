'use strict';

const getAgenda = require('./utils/getAgenda');

module.exports = (core, endpoints, agendaUid) => async function agendaRebuild() {
  const {
    services: {
      agendas: agendasSvc,
    },
  } = core;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true, private: null });

  await agendasSvc.resetCache(agenda);
  await endpoints.events.search.rebuild();
  await endpoints.settings.legacy.update(true);
};
