'use strict';

const STOP = -1;
const log = require('@openagenda/logs')('core/agendas/utils/clearAgendasCache');

async function clearAgendasCache(services) {
  const {
    simpleCache,
    agendas: svcAgendas,
  } = services;
  let offset = 0;

  try {
    let count = 0;
    while (offset !== STOP) {
      const { agendas } = await svcAgendas.list({}, offset, 20, {
        private: null,
        onlyIncludeFields: ['uid', 'id'],
        internal: true,
        offsetAsLastId: true,
      });

      for (const { uid } of agendas) {
        await simpleCache.hash('core.agendas.get', uid).del();
        count += 1;
      }

      offset = agendas.length === 0 ? STOP : agendas[agendas.length - 1].id;

      if (!(count % 1000)) {
        log.info('processed %s agendas', count);
      }
    }
    log.info('done clearing cache of %s agendas', count);
  } catch (error) {
    log('error', error);
  }
}

module.exports = clearAgendasCache;
