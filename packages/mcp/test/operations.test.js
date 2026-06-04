import {
  OPERATIONS,
  searchOperations,
  renderOperation,
  renderSearch,
  skeletonExample,
  SCHEMA_VALIDATORS,
} from '../src/docs/operations.js';

// Extract the keys used under path:{…}/query:{…} in an example, walking braces
// so it handles shorthand props (`after`) and nested objects without the
// false-negatives/positives a flat regex would produce.
function exampleParamKeys(example) {
  const keys = new Set();
  const re = /\b(path|query)\s*:\s*\{/g;
  let m;
  while ((m = re.exec(example))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < example.length && depth > 0) {
      if (example[i] === '{') depth += 1;
      else if (example[i] === '}') depth -= 1;
      i += 1;
    }
    const body = example.slice(start, i - 1);
    // Top-level tokens only: blank out nested braces before scanning.
    const flat = body.replace(/\{[^{}]*\}/g, '');
    for (const tok of flat.split(',')) {
      const key = tok.split(':')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(key)) keys.add(key);
    }
  }
  return [...keys];
}

// search_docs is the LLM's entry point — it must surface the right operation
// for a plain-language query, never return an empty list, and hand back enough
// structure (typed params, enums, response shape, a runnable example) to write
// the `execute` body in one shot.

const byId = (id) => OPERATIONS.find((o) => o.id === id);

describe('searchOperations', () => {
  it('ranks the list operation first for a listing query', () => {
    expect(searchOperations('list upcoming events')[0].id).toBe(
      'agendas.events.list',
    );
  });

  it('ranks the facets operation first for an aggregation query', () => {
    // "aggregate" + "breakdown" are facet-specific keywords; "how many"
    // ("events per city" would tie with the list op, which also keys on city).
    expect(searchOperations('aggregate breakdown counts')[0].id).toBe(
      'agendas.events.facets',
    );
  });

  it('ranks the get operation first for a single-detail query', () => {
    expect(searchOperations('get one event by uid')[0].id).toBe(
      'agendas.events.get',
    );
  });

  it('ranks facets first for an aggregation phrase', () => {
    // "how many" is a facets synonym; it should surface the aggregation op.
    expect(searchOperations('how many')[0].id).toBe('agendas.events.facets');
  });

  // Relevance regressions caught in review: short-term fuzzy matching and an
  // indexed prose `description` (which cross-references other operationIds) used
  // to surface the wrong operation for plain-language queries.
  it('does not let a short fuzzy match surface the wrong op', () => {
    // "show" must NOT fuzzy-match the facets keyword "how" — a listing query
    // stays on the listing op.
    expect(searchOperations('show events')[0].id).toBe('agendas.events.list');
    expect(searchOperations('show me events')[0].id).toBe(
      'agendas.events.list',
    );
  });

  it('ranks the listing op first for the bare resource term', () => {
    expect(searchOperations('events')[0].id).toBe('agendas.events.list');
  });

  it('does not let cross-referenced ids in prose distort ranking', () => {
    // The facets description mentions `agendas.events.list`; a bare "agendas"
    // query must still surface an agenda-level op, not facets.
    expect(searchOperations('agendas')[0].id).toBe('agendas.list');
  });

  it('returns ALL operations when nothing matches (never empty)', () => {
    const hits = searchOperations('zzzzz-nonsense');
    expect(hits).toHaveLength(OPERATIONS.length);
  });

  it('is case-insensitive', () => {
    expect(searchOperations('FACETS')[0].id).toBe('agendas.events.facets');
  });

  it.each([null, undefined, ''])('handles %p without throwing', (q) => {
    expect(() => searchOperations(q)).not.toThrow();
    expect(searchOperations(q).length).toBeGreaterThan(0);
  });
});

describe('structured params (derived from the contract)', () => {
  const list = byId('agendas.events.list');

  it('includes the path param, marked required and typed', () => {
    const agendaUid = list.params.find((p) => p.name === 'agendaUid');
    expect(agendaUid).toMatchObject({
      in: 'path',
      required: true,
      type: 'integer',
    });
  });

  it('surfaces enum values on a filter param', () => {
    const relative = list.params.find((p) => p.name === 'relative');
    expect(relative.enum).toEqual(['passed', 'upcoming', 'current']);
  });

  it('lifts default/min/max off the schema', () => {
    const limit = list.params.find((p) => p.name === 'limit');
    expect(limit).toMatchObject({ default: 20, min: 1, max: 100 });
  });

  it('resolves array item types', () => {
    const city = list.params.find((p) => p.name === 'city');
    expect(city.type).toBe('string[]');
  });
});

describe('response shape (derived from the 200 body)', () => {
  it('models a list endpoint as data[] + pagination, summary variant first', () => {
    const { response } = byId('agendas.events.list');
    expect(response.kind).toBe('list');
    expect(response.root).toBe('EventList');
    expect(response.pagination).toBe(true);
    expect(response.item.variants).toEqual(['EventSummary', 'Event']);
    const fields = response.item.fields.map((f) => f.name);
    expect(fields).toEqual(
      expect.arrayContaining(['title', 'dateRange', 'location']),
    );
  });

  it('models a single-resource endpoint as a flat object', () => {
    const { response } = byId('agendas.events.get');
    expect(response.kind).toBe('object');
    expect(response.root).toBe('Event');
  });

  it('models the facets endpoint', () => {
    const { response } = byId('agendas.events.facets');
    expect(response.root).toBe('FacetResults');
  });

  it('resolves allOf-wrapped field types by name (not "any")', () => {
    // dateRange is `allOf: [$ref LocalizedString]`; it must keep its schema name.
    const { response } = byId('agendas.events.list');
    const dateRange = response.item.fields.find((f) => f.name === 'dateRange');
    expect(dateRange.type).toBe('LocalizedString');
  });
});

describe('examples', () => {
  it('every operation carries a runnable oa.<id>(…) example', () => {
    for (const op of OPERATIONS) {
      expect(op.example).toContain(`oa.${op.id}(`);
      expect(op.example).toMatch(/return /);
    }
  });

  it('uses the curated x-codeSamples sample when present', () => {
    // agendas.events.list carries a curated TypeScript sample (a paging loop);
    // exampleFor must prefer it over the auto skeleton.
    const { example } = byId('agendas.events.list');
    expect(example).toContain('agendaUid');
    expect(example).toContain('do {');
  });

  describe('auto-derived skeleton (skeletonExample)', () => {
    it('fills the required path param and checks {data,error}', () => {
      const ex = skeletonExample('agendas.events.get', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
        { name: 'eventUid', in: 'path', required: true, type: 'integer' },
      ]);
      expect(ex).toContain('path: { agendaUid: 123, eventUid: 123 }');
      expect(ex).toContain('if (error) throw error;');
    });

    it('wraps an array-enum param in an array literal (not a bare scalar)', () => {
      // Regression: an enum lifted from items.enum belongs to an array param and
      // must still be wrapped — `['cities']`, not `"cities"`.
      const ex = skeletonExample('agendas.events.facets', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
        {
          name: 'facets',
          in: 'query',
          required: true,
          type: 'string[]',
          enum: ['cities', 'regions'],
        },
      ]);
      expect(ex).toContain('query: { facets: ["cities"] }');
    });

    it('omits required query params that have none', () => {
      const ex = skeletonExample('agendas.get', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
      ]);
      expect(ex).toContain('oa.agendas.get({ path: { agendaUid: 123 } })');
    });
  });

  // Anti-drift: any param identifier used as a key in an example's path/query
  // object MUST be a real param of the operation — catches a curated
  // x-codeSamples sample (or skeleton) that drifts from a renamed param.
  it('example param keys all reference real params', () => {
    for (const op of OPERATIONS) {
      const known = new Set(op.params.map((p) => p.name));
      for (const key of exampleParamKeys(op.example)) {
        expect(known.has(key)).toBe(true);
      }
    }
  });

  it('the anti-drift extractor catches shorthand props (after)', () => {
    // `query: { …, after }` — the shorthand `after` must be extracted (it is a
    // real AfterCursor param); a flat regex would silently drop it.
    expect(exampleParamKeys('oa.x({ query: { limit: 100, after } })')).toEqual(
      expect.arrayContaining(['limit', 'after']),
    );
  });

  it('the anti-drift extractor handles nested objects without false hits', () => {
    // A nested value (extId deepObject) must not leak its inner keys as params,
    // and a top-level key after the nested object must still be caught.
    const keys = exampleParamKeys(
      "oa.x({ query: { extId: { key: 'a' }, slug: 'b' } })",
    );
    expect(keys).toEqual(expect.arrayContaining(['extId', 'slug']));
    expect(keys).not.toContain('key');
  });
});

describe('renderOperation', () => {
  it('renders a rich block (rank 0): signature, params, response, example', () => {
    const md = renderOperation(byId('agendas.events.list'), 0);
    expect(md).toContain('### agendas.events.list');
    expect(md).toContain(
      '`oa.agendas.events.list({ path: { agendaUid }, query })`',
    );
    expect(md).toContain('GET /agendas/{agendaUid}/events');
    expect(md).toContain('Parameters:');
    // enum values surfaced inline for the LLM
    expect(md).toMatch(/relative.*passed, upcoming, current/s);
    expect(md).toContain('Response:');
    expect(md).toContain('EventSummary');
    expect(md).toContain('Example:');
  });

  it('renders a compact one-liner past the rank cutoff', () => {
    const md = renderOperation(byId('agendas.events.list'), 5);
    expect(md).toContain('### agendas.events.list');
    expect(md).toContain('`oa.agendas.events.list(');
    expect(md).not.toContain('Parameters:');
    expect(md).not.toContain('Example:');
  });
});

describe('renderSearch', () => {
  it('appends the validators footer with the contract-derived list', () => {
    const text = renderSearch(searchOperations('events'));
    expect(text).toContain('schemas');
    expect(text).toContain('zEvent');
  });
});

describe('SCHEMA_VALIDATORS', () => {
  it('derives one z<Name> per component schema', () => {
    expect(SCHEMA_VALIDATORS).toEqual(
      expect.arrayContaining(['zEvent', 'zEventList', 'zFacetResults']),
    );
    expect(SCHEMA_VALIDATORS.every((n) => n.startsWith('z'))).toBe(true);
  });
});

describe('OPERATIONS catalogue', () => {
  it('every entry is well-formed (id, call, summary, params, response, example)', () => {
    for (const op of OPERATIONS) {
      expect(typeof op.id).toBe('string');
      expect(op.call).toContain(`oa.${op.id}(`);
      expect(op.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(op.keywords)).toBe(true);
      expect(op.keywords.length).toBeGreaterThan(0);
      expect(Array.isArray(op.params)).toBe(true);
      expect(op.response).not.toBeNull();
      expect(op.example.length).toBeGreaterThan(0);
    }
  });
});
