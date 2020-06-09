'use strict';

const log = require('@openagenda/logs')('services/agendaSearch/listAgendas');

module.exports = async (services, query, lastId, limit) => {
  const {
    agendas,
    lastId: nextLastId
  } = await services.agendas.list(query, lastId, limit, {
    indexed: true,
    offsetAsLastId: true,
    keywords: []
  });

  log('info', 'listed %s agendas for reindexing', agendas.length);

  for (const agenda of agendas) {
    try {
      const result = await services.core.agendas(agenda.uid).events.search({}, { size: 0 }, {
        aggregations: ['cities', 'departments', 'regions', 'pastAndUpcoming', 'keywords']
      });

      agenda.keywords = ['cities', 'departments', 'regions', 'keywords']
        .reduce(
          (keywords, agg) => keywords.concat(result.aggregations[agg].map(a => a.key)),
          []
        );

      agenda.upcomingPublishedEvents = result.aggregations.pastAndUpcoming.filter(a => a.key === 'upcoming').pop().eventCount;
      agenda.publishedEvents = agenda.upcomingPublishedEvents + result.aggregations.pastAndUpcoming.filter(a => a.key === 'past').pop().eventCount;
    } catch (e) {
      log('error', 'failed to get details of agenda %s', agenda.uid);
    }
  }

  return {
    items: agendas,
    lastId: nextLastId
  }
}
