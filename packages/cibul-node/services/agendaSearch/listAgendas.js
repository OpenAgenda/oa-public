'use strict';

const log = require('@openagenda/logs')('services/agendaSearch/listAgendas');

module.exports = async (services, query, lastId, limit) => {
  const {
    agendas,
    lastId: nextLastId
  } = await services.agendas.list(query, lastId, limit, {
    indexed: true,
    offsetAsLastId: true,
    keywords: [],
    includeFields: [
      'uid',
      'slug',
      'official',
      'title',
      'description',
      'url',
      'image',
      'updatedAt',
      'createdAt',
      'officializedAt',
      'private',
      'indexed',
      'networkUid'
    ]
  });

  log('info', 'listed %s agendas for reindexing', agendas.length);

  return {
    items: agendas,
    lastId: nextLastId
  }
}
