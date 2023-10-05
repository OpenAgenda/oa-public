'use strict';

const log = require('@openagenda/logs')('core/agendas/utils/clearAgendasCache');

async function clearAgendasCache(services) {
  const {
    simpleCache,
    agendas: svcAgendas,
  } = services;
  let idGreaterThan = 0;

  try {
    while (true) {
      const { agendas } = await svcAgendas.list({ idGreaterThan }, 0, 20, { private: null, onlyIncludeFields: ['uid', 'id'], internal: true });
      for (const { uid } of agendas) {
        await simpleCache.hash('core.agendas.get', uid).del();
      }
      if (agendas.length === 0) break;
      idGreaterThan = agendas[agendas.length - 1].id;
    }
  } catch (error) {
    log('error', error);
  }
}

module.exports = clearAgendasCache;
