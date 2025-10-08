const getRecentlyAddedEvents = (core, agenda) => {
  const recentThreshold = new Date();
  recentThreshold.setDate(
    recentThreshold.getDate() - core.getConfig().agendaSearchRecentThreshold,
  );

  return core.services.eventSearch
    .agendas(agenda)
    .search(
      {
        originAgendaUid: agenda.uid, // own contributions
        state: null, // ... of any state
        createdAt: { gte: recentThreshold },
        date: { gte: new Date() },
      },
      { size: 0 },
      { aggregations: ['addMethods'] },
    )
    .then(({ aggregations }) => {
      if (!aggregations?.addMethods) {
        return { contribution: 0, shared: 0, aggregation: 0 };
      }
      return aggregations.addMethods.reduce(
        (carry, { key, eventCount }) => ({
          ...carry,
          [key]: eventCount,
        }),
        { contribution: 0, shared: 0, aggregation: 0 },
      );
    });
};

const getPublishedEventsCounts = async (core, agenda) => {
  const stream = await core
    .agendas(agenda.uid)
    .events.search({ state: 2 }, null, {
      includeFields: ['location.uid', 'creatorUid'],
      stream: true,
    });

  const locationsUids = [];
  const creatorsUids = [];
  let eventsCount = 0;
  for await (const event of stream) {
    eventsCount += 1;
    if (event.location?.uid && !locationsUids.includes(event.location.uid)) {
      locationsUids.push(event.location.uid);
    }
    if (event.creatorUid && !creatorsUids.includes(event.creatorUid)) {
      creatorsUids.push(event.creatorUid);
    }
  }

  return {
    locationsCount: locationsUids.length,
    creatorsCount: creatorsUids.length,
    eventsCount,
  };
};

const loadSummary = async (core, agenda, options = {}) => {
  const { access = 'public', includes = [] } = options;

  const { search } = core.services.eventSearch.agendas(agenda);

  const publishedResult = await search(
    {},
    { size: 0 },
    {
      aggregations: [
        'cities',
        'departments',
        'regions',
        'relative',
        'keywords',
        'languages',
      ],
    },
  ).then(({ aggregations }) => aggregations);

  const summary = {
    keywords: ['cities', 'departments', 'regions', 'keywords'].reduce(
      (keywords, agg) => {
        const aggData = publishedResult[agg];
        if (!aggData || !Array.isArray(aggData)) return keywords;
        return keywords.concat(aggData.map((a) => a.key));
      },
      [],
    ),
    publishedEvents: (publishedResult.relative || []).reduce(
      (carry, { key, eventCount }) => ({
        ...carry,
        [key]: eventCount,
      }),
      {},
    ),
    languages: (publishedResult.languages || []).reduce(
      (carry, { key, eventCount }) => ({
        ...carry,
        [key]: eventCount,
      }),
      {},
    ),
    recentlyAddedEvents: await getRecentlyAddedEvents(core, agenda),
  };

  if (['administrator', 'moderator', 'internal'].includes(access)) {
    summary.eventCountsByState = await search(
      {
        state: null,
      },
      { size: 0 },
      {
        aggregations: ['states'],
      },
    ).then(({ aggregations }) => aggregations.states);
  }

  summary.viewport = await search(
    ['administrator', 'moderator', 'internal'].includes(access)
      ? { state: null }
      : {},
    { size: 0 },
    { aggregations: 'viewport' },
  ).then(({ aggregations }) => aggregations.viewport);

  if (includes.includes('publishedEvents')) {
    const totals = await getPublishedEventsCounts(core, agenda);
    summary.publishedEvents = {
      ...summary.publishedEvents,
      events: totals.eventsCount,
      eventLocations: totals.locationsCount,
      eventCreators: totals.creatorsCount,
    };
  }

  return summary;
};

const loadAgendaAndSummary = async (core, agendaUid, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    access: options.access || 'public',
  });
  return loadSummary(core, agenda, options);
};

export default Object.assign(loadSummary, {
  agendaAndSummary: loadAgendaAndSummary,
});
