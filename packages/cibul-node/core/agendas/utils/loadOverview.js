// v3 agenda "overview" loader — the live source behind GET /agendas/:uid/overview.
//
// Distinct from `loadSummary` (which stays frozen: its flat shape is the v2
// `/summary` contract). This computes the v3 `AgendaOverview` structure natively:
// two orthogonal axes — visibility scope (published vs all-states) × metric
// vocabulary (totals, `by<Dim>` distributions, viewport, keywords) — plus a
// hoisted `recentlyAdded` time-slice. See docs/design-v3-agenda-summary.md.
//
// Access is structural and per-scope: the `published` scope is computed for
// everyone; the `all` scope (all states — moderation/refused included) is
// computed ONLY for administrator|moderator|internal callers and is otherwise
// absent (not empty). All values are live (never the index-time snapshot), so
// no access-gated datum can leak through a cache computed at a different access.

const PRIVILEGED = ['administrator', 'moderator', 'internal'];

// Fallback for the recent-window config when it parses to a non-number
// (mirrors the `agendaSearchRecentThreshold` default in config/index.js).
const DEFAULT_RECENT_WINDOW = 14;

// Aggregation bundle shared by both scopes (the symmetric vocabulary). The only
// scope-specific aggregation is `states`, requested for the `all` scope alone —
// a per-state breakdown is meaningless once filtered to published only.
const SCOPE_AGGREGATIONS = [
  // keyword sources, merged into a single `keywords` list
  'cities',
  'departments',
  'regions',
  'keywords',
  // distributions
  'relative', // -> timeline (current/passed/upcoming)
  'languages', // -> byLanguage
  'addMethods', // -> bySource
  'lastTimings', // -> byEndDay + laterDays
  // spatial
  'viewport',
];

// terms-style agg result ([{ key, eventCount }]) -> map { key: eventCount }.
const termsToMap = (buckets) =>
  (buckets || []).reduce(
    (carry, { key, eventCount }) => ({ ...carry, [key]: eventCount }),
    {},
  );

// addMethods -> a stable { contribution, shared, aggregation } source map: the
// three known add methods are always present (0 when absent) so the shape never
// drifts with the data.
const sourceMap = (buckets) => ({
  contribution: 0,
  shared: 0,
  aggregation: 0,
  ...termsToMap(buckets),
});

// Merge the four keyword-bearing aggregations into one de-duplicated term list.
const mergeKeywords = (aggregations) =>
  ['cities', 'departments', 'regions', 'keywords'].reduce((keywords, agg) => {
    const data = aggregations[agg];
    if (!Array.isArray(data)) return keywords;
    for (const { key } of data) {
      if (key != null && !keywords.includes(key)) keywords.push(key);
    }
    return keywords;
  }, []);

// Exact distinct location/creator counts over the published set, by streaming
// the projected events (same approach as v2's loadSummary). Bounded to the
// published population — deliberately NOT run over the `all` scope, whose
// all-states population (refused/moderation included) can be orders of
// magnitude larger. Future optimisation: cardinality aggregations once
// `creatorUid` is mapped for aggregation (see design doc, decision #6).
const getPublishedDistinctCounts = async (core, agenda) => {
  const stream = await core
    .agendas(agenda.uid)
    .events.search({ state: 2 }, null, {
      includeFields: ['location.uid', 'creatorUid'],
      stream: true,
    });

  const locations = new Set();
  const creators = new Set();
  for await (const event of stream) {
    if (event.location?.uid != null) locations.add(event.location.uid);
    if (event.creatorUid != null) creators.add(event.creatorUid);
  }

  return { locations: locations.size, creators: creators.size };
};

// Compute one scope's metric bundle. `query` is the scope filter: `{}` for the
// published default, `{ state: null }` for all states.
const computeScope = async (search, query, { withStates = false } = {}) => {
  const { total, aggregations } = await search(
    query,
    { size: 0 },
    {
      aggregations: withStates
        ? [...SCOPE_AGGREGATIONS, 'states']
        : SCOPE_AGGREGATIONS,
    },
  );

  const timeline = termsToMap(aggregations.relative);

  return {
    total,
    timeline: {
      current: timeline.current || 0,
      passed: timeline.passed || 0,
      upcoming: timeline.upcoming || 0,
    },
    byLanguage: termsToMap(aggregations.languages),
    bySource: sourceMap(aggregations.addMethods),
    byEndDay: aggregations.lastTimings?.eventsByEndDay || {},
    laterDays: aggregations.lastTimings?.laterDays || 0,
    viewport: aggregations.viewport ?? null,
    keywords: mergeKeywords(aggregations),
    ...withStates ? { byState: termsToMap(aggregations.states) } : {},
  };
};

// recentlyAdded: a single windowed slice of the agenda's own recent
// contributions, broken down by source. Hoisted to the root — it is a
// time-slice, not a visibility scope. Computed PUBLISHED-ONLY for every caller:
// keeping it a single-meaning public stat avoids an access-dependent value (the
// same footgun the per-scope viewport split avoids). A gated all-states recent
// slice can be added additively later if a privileged need is concrete.
const computeRecentlyAdded = async (core, agenda) => {
  const configured = core.getConfig().agendaSearchRecentThreshold;
  // Guard a non-numeric config (e.g. parseInt('abc') -> NaN): NaN would poison
  // the ES date filter AND surface as `window: NaN`, breaking the integer
  // contract (the mapper's `?? 0` does not catch NaN).
  const window = Number.isFinite(configured)
    ? configured
    : DEFAULT_RECENT_WINDOW;

  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - window);

  const { aggregations } = await core.services.eventSearch
    .agendas(agenda)
    .search(
      {
        originAgendaUid: agenda.uid, // own contributions
        state: 2, // ... published only (no all-states figure reaches the public)
        createdAt: { gte: recentThreshold },
        date: { gte: new Date() },
      },
      { size: 0 },
      { aggregations: ['addMethods'] },
    );

  return { window, bySource: sourceMap(aggregations?.addMethods) };
};

const loadOverview = async (core, agenda, options = {}) => {
  const { access = 'public' } = options;
  const privileged = PRIVILEGED.includes(access);

  const { search } = core.services.eventSearch.agendas(agenda);

  // The published scope is computed for every caller. Distinct counts stream
  // the published set; the rest is one aggregation pass.
  const [publishedScope, publishedDistinct, recentlyAdded] = await Promise.all([
    computeScope(search, {}),
    getPublishedDistinctCounts(core, agenda),
    computeRecentlyAdded(core, agenda),
  ]);

  const published = {
    ...publishedScope,
    locations: publishedDistinct.locations,
    creators: publishedDistinct.creators,
  };

  // The all-states scope is gated: only privileged callers materialise it.
  const all = privileged
    ? await computeScope(search, { state: null }, { withStates: true })
    : null;

  return { published, all, recentlyAdded };
};

const loadAgendaAndOverview = async (core, agendaOrUid, options = {}) => {
  // Accept an already-loaded agenda (the v3 route hands its `req.agenda`
  // straight through) to skip a redundant SQL get; fall back to fetching by uid
  // for callers that only hold the uid.
  const agenda = agendaOrUid !== null && typeof agendaOrUid === 'object'
    ? agendaOrUid
    : await core
      .agendas(agendaOrUid)
      .get({ access: options.access || 'public' });
  return loadOverview(core, agenda, options);
};

export default Object.assign(loadOverview, {
  agendaAndOverview: loadAgendaAndOverview,
});
