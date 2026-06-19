// Pure mapper: `core.agendas(uid).overview()` output -> the public v3
// `AgendaOverview` contract (see public/api-spec/openapi.yaml).
//
// The loader already produces the two-axis structure; this layer is the
// contract authority — it pins field presence per scope and normalises shapes:
//   - `published` carries the distinct counts (`locations`/`creators`); `all`
//     carries the per-state breakdown (`byState`). These are the only
//     scope-specific keys — everything else is the shared `EventScopeStats`
//     vocabulary.
//   - `events.all` is present ONLY when the loader computed it (privileged
//     access); otherwise the key is absent (not null), matching the schema's
//     `optional` gate.

// A viewport bounding box -> `{ topLeft, bottomRight }` or `null`. The geo_bounds
// aggregation already returns that shape (or null); coerce defensively.
const toViewport = (viewport) => {
  if (!viewport?.topLeft || !viewport?.bottomRight) return null;
  return {
    topLeft: {
      latitude: viewport.topLeft.latitude,
      longitude: viewport.topLeft.longitude,
    },
    bottomRight: {
      latitude: viewport.bottomRight.latitude,
      longitude: viewport.bottomRight.longitude,
    },
  };
};

// The metric vocabulary shared by both scopes.
function commonScope(scope) {
  return {
    total: scope.total ?? 0,
    timeline: {
      current: scope.timeline?.current ?? 0,
      passed: scope.timeline?.passed ?? 0,
      upcoming: scope.timeline?.upcoming ?? 0,
    },
    byLanguage: scope.byLanguage ?? {},
    bySource: scope.bySource ?? {},
    byEndDay: scope.byEndDay ?? {},
    laterDays: scope.laterDays ?? 0,
    viewport: toViewport(scope.viewport),
    keywords: Array.isArray(scope.keywords) ? scope.keywords : [],
  };
}

function mapPublishedScope(scope) {
  return {
    ...commonScope(scope),
    locations: scope.locations ?? 0,
    creators: scope.creators ?? 0,
  };
}

function mapAllScope(scope) {
  return {
    ...commonScope(scope),
    byState: scope.byState ?? {},
  };
}

export default function mapAgendaOverview(overview) {
  const { published, all, recentlyAdded } = overview ?? {};

  return {
    events: {
      published: mapPublishedScope(published ?? {}),
      // Gated scope: only emitted when the loader materialised it.
      ...all ? { all: mapAllScope(all) } : {},
    },
    recentlyAdded: {
      window: recentlyAdded?.window ?? 0,
      bySource: recentlyAdded?.bySource ?? {},
    },
  };
}
