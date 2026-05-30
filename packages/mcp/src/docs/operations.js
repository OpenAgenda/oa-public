// A small, hand-curated index of the v3 READ operations, used by `search_docs`.
//
// POC scope: the read surface only (list / get / facets). In production this is
// generated from packages/api-spec/openapi.yaml (and the generated SDK's doc
// comments) so it always tracks the contract — here it's inlined to keep the
// POC self-contained. Each entry is what the LLM needs to write `execute` code.

/**
 * @typedef {object} Operation
 * @property {string} id
 * @property {string} call        How to invoke it via the `oa` client.
 * @property {string} summary
 * @property {string[]} keywords  Cheap relevance matching for search_docs.
 * @property {string} details
 */

/** @type {Operation[]} */
export const OPERATIONS = [
  {
    id: 'listEvents',
    call: 'oa.listEvents(agendaUid, params)',
    summary: 'List published events of an agenda (cursor-paginated).',
    keywords: [
      'list',
      'events',
      'search',
      'filter',
      'paginate',
      'cursor',
      'when',
      'where',
      'city',
      'date',
    ],
    details: [
      'GET /agendas/{agendaUid}/events — returns { events, pagination, total }.',
      'Pagination: pass params.after = pagination.after to get the next page; resend the same filters.',
      'View: limit (1–100, default 20), detailed (true → full Event, default false → summary), sort.',
      'Text/identity: search, uid, slug, ext_id.',
      'Classification: keyword, lang, accessibility, status, attendanceMode, featured.',
      'Place: locationUid, region, department, city, district, countryCode, near ("lng,lat"), radius (m), boundingBox.',
      'Time: relative (e.g. "upcoming","current","passed"), timings (date range), localTime, createdAt, updatedAt.',
      'Audience/extra: age, additionalFields[<key>]=<value>.',
      'Example: oa.listEvents("my-agenda", { city: "Paris", relative: "upcoming", limit: 50 })',
    ].join('\n'),
  },
  {
    id: 'getEvent',
    call: 'oa.getEvent(agendaUid, eventUid)',
    summary: 'Fetch one event (full detail) by uid.',
    keywords: ['get', 'event', 'detail', 'single', 'one', 'by id', 'uid'],
    details: [
      'GET /agendas/{agendaUid}/events/{eventUid} — returns the full Event.',
      'Example: oa.getEvent("my-agenda", 12345678)',
    ].join('\n'),
  },
  {
    id: 'getFacets',
    call: 'oa.getFacets(agendaUid, params)',
    summary: 'Aggregated counts over the SAME filtered set as listEvents.',
    keywords: [
      'facets',
      'aggregate',
      'count',
      'group',
      'stats',
      'histogram',
      'how many',
      'breakdown',
      'timings',
      'timespan',
      'dateRanges',
    ],
    details: [
      'GET /agendas/{agendaUid}/events/facets — returns counts (no event hits).',
      'facets (CSV): which families to compute, e.g. "keyword,city,timings,timespan,dateRanges,additionalFields,additionalFieldMetrics".',
      'Accepts the SAME filter params as listEvents to scope the set.',
      'timingsInterval (for timings: hour|day|week|month), month=YYYY-MM (for dateRanges),',
      'additionalFieldsKeys / additionalFieldMetricsKeys (CSV of field keys to break down).',
      'Example: oa.getFacets("my-agenda", { facets: "city,timings", relative: "upcoming", timingsInterval: "week" })',
    ].join('\n'),
  },
];

/** Cheap keyword/substring relevance scan. Returns all ops if nothing matches. */
export function searchOperations(query) {
  const q = String(query ?? '').toLowerCase();
  const scored = OPERATIONS.map((op) => {
    const haystack = `${op.id} ${op.summary} ${op.keywords.join(' ')}`.toLowerCase();
    // Multi-word keywords ("how many", "by id") are more specific → weigh them higher.
    const score = op.keywords.reduce((s, k) => {
      if (!(q.includes(k) || k.includes(q))) return s;
      return s + (k.includes(' ') ? 2 : 1);
    }, 0) + (haystack.includes(q) ? 1 : 0);
    return { op, score };
  });
  const hits = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return (hits.length ? hits : scored).map((s) => s.op);
}

export function renderOperation(op) {
  return `### ${op.id}\n\`${op.call}\`\n${op.summary}\n\n${op.details}`;
}
