import logs from '@openagenda/logs';

const log = logs('services/agendaSearch/listAgendas');

export default services => async (query, lastId, limit) => {
  const {
    agendas,
    lastId: nextLastId,
  } = await services.agendas.list(query, lastId, limit, {
    offsetAsLastId: true,
    keywords: [],
    fields: ['uid', 'slug'],
  });

  log('info', 'listed %s agendas for reindexing', agendas.length);

  return {
    items: agendas,
    lastId: nextLastId,
  };
};
