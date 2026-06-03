import {
  OPERATIONS,
  searchOperations,
  renderOperation,
} from '../src/docs/operations.js';

// search_docs is the LLM's entry point — it must surface the right operation
// for a plain-language query and never return an empty list.

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

  it('weighs multi-word keywords higher than single-word ones', () => {
    // "how many" (multi-word, facets) should beat the bare "event" hit.
    expect(searchOperations('how many')[0].id).toBe('agendas.events.facets');
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

describe('renderOperation', () => {
  it('renders the call signature, summary and details as markdown', () => {
    const md = renderOperation(
      OPERATIONS.find((o) => o.id === 'agendas.events.list'),
    );
    expect(md).toContain('### agendas.events.list');
    expect(md).toContain(
      '`oa.agendas.events.list({ path: { agendaUid }, query })`',
    );
    expect(md).toContain('GET /agendas/{agendaUid}/events');
  });
});

describe('OPERATIONS catalogue', () => {
  it('every entry is well-formed (id, call, summary, keywords, details)', () => {
    for (const op of OPERATIONS) {
      expect(typeof op.id).toBe('string');
      expect(op.call).toContain(`oa.${op.id}(`);
      expect(op.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(op.keywords)).toBe(true);
      expect(op.keywords.length).toBeGreaterThan(0);
      expect(op.details.length).toBeGreaterThan(0);
    }
  });
});
