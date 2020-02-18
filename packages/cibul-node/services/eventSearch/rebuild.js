'use strict';

const log = require('@openagenda/logs')('services/eventSearch/rebuild');

module.exports = async (services, eventSearch, rebuildQueue) => {
  const {
    agendas: agendasSvc
  } = services;

  let lastId = 9999999999999;
  let count = 0;

  do {
    const {
      agendas,
      lastId: newLastId
    } = await agendasSvc.list({
      //search: 'Ville de CENON',
      order: 'id.desc'
    }, lastId, 100, {
      offsetAsLastId: true,
      internal: null
    });

    for (const agenda of agendas) {
      log('%s: queuing rebuild', agenda.slug);
      await rebuildQueue('agenda', agenda);
      count++;
    }

    lastId = newLastId;
  } while (lastId > -1);

  log('info', 'completed rebuild queueing for %s agendas', count);

  await rebuildQueue('transverse');
}
