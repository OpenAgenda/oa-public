'use strict';

const getRecentlyAddedEvents = (core, agenda) => {
  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - core.getConfig().agendaSearchRecentThreshold);

  return core.services.eventSearch.agendas(agenda).search({
    originAgendaUid: agenda.uid, // own contributions
    state: null, // ... of any state
    createdAt: { gte: recentThreshold },
    date: { gte: new Date() }
  }, { size: 0 }, { aggregations: ['addMethods'] })
    .then(({ aggregations }) => aggregations.addMethods.reduce((carry, { key, eventCount }) => ({
      ...carry,
      [key]: eventCount
    }), { contribution: 0, shared: 0, aggregation: 0 }));
};

module.exports = async (core, agenda, options = {}) => {
  const {
    access = 'public'
  } = options;

  const { search } = core.services.eventSearch.agendas(agenda);

  const publishedResult = await search({}, { size: 0 }, {
    aggregations: ['cities', 'departments', 'regions', 'relative', 'keywords', 'languages']
  }).then(({ aggregations }) => aggregations);

  const summary = {
    keywords: ['cities', 'departments', 'regions', 'keywords'].reduce(
      (keywords, agg) => keywords.concat(publishedResult[agg].map(a => a.key)),
      []
    ),
    publishedEvents: publishedResult.relative.reduce((carry, { key, eventCount }) => ({
      ...carry,
      [key]: eventCount
    }), {}),
    languages: publishedResult.languages.reduce((carry, { key, eventCount }) => ({
      ...carry,
      [key]: eventCount
    }), {}),
    recentlyAddedEvents: await getRecentlyAddedEvents(core, agenda)
  };

  console.log('SUMMARY', summary, publishedResult);

  if (['administrator', 'moderator', 'internal'].includes(access)) {
    summary.eventCountsByState = await search({
      state: null
    }, { size: 0 }, {
      aggregations: ['states']
    }).then(({ aggregations }) => aggregations.states);
  }

  summary.viewport = await search(
    ['administrator', 'moderator', 'internal'].includes(access) ? { state: null } : {},
    { size: 0 },
    { aggregations: 'viewport' }
  ).then(({ aggregations }) => aggregations.viewport);

  return summary;
};
