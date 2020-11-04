'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaSearch/getAgendaSummary');

module.exports = async (config, services, agenda) => {
  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - config.agendaSearchRecentThreshold);

  const { total: recentlyContributedEvents } = await services.core.agendas(agenda.uid).events.search({
    originAgendaUid: agenda.uid, // own contributions
    state: null, // ... of any state
    createdAt: {
      gte: recentThreshold
    },
    date: {
      gte: new Date()
    }
  }, { size: 0 });

  const publishedResult = await services.core.agendas(agenda.uid).events.search({}, { size: 0 }, {
    aggregations: ['cities', 'departments', 'regions', 'pastAndUpcoming', 'keywords']
  });

  const keywords = ['cities', 'departments', 'regions', 'keywords']
    .reduce(
      (keywords, agg) => keywords.concat(publishedResult.aggregations[agg].map(a => a.key)),
      []
    );

  const upcomingPublishedEvents = publishedResult.aggregations.pastAndUpcoming.filter(a => a.key === 'upcoming').pop().eventCount;
  const publishedEvents = agenda.upcomingPublishedEvents + publishedResult.aggregations.pastAndUpcoming.filter(a => a.key === 'past').pop().eventCount;

  const result = await services.core.agendas(agenda.uid).events.search({}, { size: 0 }, {
    aggregations: ['states']
  });

  return {
    recentlyContributedEvents,
    upcomingPublishedEvents,
    publishedEvents,
    keywords,
    eventCountsByState: result.aggregations.states,
    network: agenda.networkUid ? await services.networks.get(agenda.networkUid) : null
  }
}
