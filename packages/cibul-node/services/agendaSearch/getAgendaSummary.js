'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaSearch/getAgendaSummary');

module.exports = async (config, services, agenda) => {
  const result = await services.core.agendas(agenda.uid).events.search({}, { size: 0 }, {
    aggregations: ['cities', 'departments', 'regions', 'pastAndUpcoming', 'keywords']
  });

  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - config.agendaSearchRecentThreshold);

  const { total: recentlyContributedEvents } = await services.core.agendas(agenda.uid).events.search({
    originAgendaUid: agenda.uid, // own contributions
    state: null, // ... of any state
    updatedAt: {
      gte: recentThreshold
    }
  }, { size: 0 });

  const keywords = ['cities', 'departments', 'regions', 'keywords']
    .reduce(
      (keywords, agg) => keywords.concat(result.aggregations[agg].map(a => a.key)),
      []
    );

  const upcomingPublishedEvents = result.aggregations.pastAndUpcoming.filter(a => a.key === 'upcoming').pop().eventCount;
  const publishedEvents = agenda.upcomingPublishedEvents + result.aggregations.pastAndUpcoming.filter(a => a.key === 'past').pop().eventCount;

  return {
    recentlyContributedEvents,
    upcomingPublishedEvents,
    publishedEvents,
    keywords,
    network: agenda.networkUid ? await services.networks.get(agenda.networkUid) : null
  }
}
