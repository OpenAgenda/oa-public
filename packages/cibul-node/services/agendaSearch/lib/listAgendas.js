'use strict';

const log = require('@openagenda/logs')('services/agendaSearch/listAgendas');

module.exports = services => async (query, lastId, limit) => {
  const {
    core
  } = services;
  const {
    agendas,
    lastId: nextLastId
  } = await services.agendas.list(query, lastId, limit, {
    offsetAsLastId: true,
    keywords: [],
    fields: ['uid', 'slug']
  });

  log('info', 'listed %s agendas for reindexing', agendas.length);

  return {
    items: agendas,
    lastId: nextLastId
  }
}
