import Search from '../search.js';
import searchIncludes from '../config/searchIncludes.json' with { type: 'json' };

// A mock ES client that distinguishes the relevance probe (`_source: false`)
// from the real search, records every request body, and lets the probe return
// a chosen score distribution.
function mockClient(probeScores = [], mainHits = { total: 0, hits: [] }) {
  const bodies = [];

  const client = {
    bodies,
    search: async ({ body }) => {
      bodies.push(body);

      const isProbe = body._source === false;

      if (isProbe) {
        return {
          statusCode: 200,
          body: {
            _shards: {},
            hits: {
              total: { value: probeScores.length },
              hits: probeScores.map((s, i) => ({ _id: `${i}`, _score: s })),
            },
          },
        };
      }

      // The real search — caller controls hits so we can exercise the cursor.
      return {
        statusCode: 200,
        body: {
          _shards: {},
          hits: {
            total: { value: mainHits.total },
            hits: mainHits.hits,
          },
        },
      };
    },
  };

  return client;
}

function makeSearch(probeScores, mainHits, configOverrides = {}) {
  const client = mockClient(probeScores, mainHits);
  const config = {
    client,
    type: 'event',
    baseSearchIncludes: searchIncludes.base,
    detailedSearchIncludes: searchIncludes.detailed,
    otherStandardFields: searchIncludes.other,
    defaultIndex: 'main',
    emptyValue: 'null',
    assetsPath: null,
    ...configOverrides,
  };

  return { search: Search(config, 'test'), client };
}

const probeBodies = (client) =>
  client.bodies.filter((b) => b._source === false);
const mainBody = (client) => client.bodies.find((b) => b._source !== false);

describe('event-search - unit: search threshold wiring', () => {
  it('threshold=auto probes and sets a min_score on the real query (cliff)', async () => {
    const { search, client } = makeSearch([800, 10, 9, 8, 7]);

    await search({ search: 'balade', threshold: 'auto' });

    expect(probeBodies(client)).toHaveLength(1);
    const probe = probeBodies(client)[0];
    expect(probe.size).toBe(20);
    expect(probe._source).toBe(false);
    expect(probe.track_total_hits).toBe(false);

    const main = mainBody(client);
    expect(main.min_score).toBeGreaterThan(10);
    expect(main.min_score).toBeLessThan(800);
  });

  it('threshold=auto with a flat distribution sets no min_score', async () => {
    const { search, client } = makeSearch([50, 48, 45, 42, 40]);

    await search({ search: 'balade', threshold: 'auto' });

    expect(probeBodies(client)).toHaveLength(1);
    expect(mainBody(client).min_score).toBeUndefined();
  });

  it('numeric threshold applies min_score directly without probing', async () => {
    const { search, client } = makeSearch();

    await search({ search: 'balade', threshold: 20 });

    expect(probeBodies(client)).toHaveLength(0);
    expect(mainBody(client).min_score).toBe(20);
  });

  it('threshold=off applies no filtering and no probe', async () => {
    const { search, client } = makeSearch();

    await search({ search: 'balade', threshold: 'off' });

    expect(probeBodies(client)).toHaveLength(0);
    expect(mainBody(client).min_score).toBeUndefined();
  });

  it('a falsy threshold ("false") is normalised to off — no probe, no floor', async () => {
    const { search, client } = makeSearch();

    await search({ search: 'balade', threshold: 'false' });

    expect(probeBodies(client)).toHaveLength(0);
    expect(mainBody(client).min_score).toBeUndefined();
  });

  it('no threshold param leaves the query untouched', async () => {
    const { search, client } = makeSearch();

    await search({ search: 'balade' });

    expect(probeBodies(client)).toHaveLength(0);
    expect(mainBody(client).min_score).toBeUndefined();
  });

  it('threshold is ignored without a syntactic search', async () => {
    const { search, client } = makeSearch([800, 10, 9]);

    // No `search` term -> scores are uniform, so the floor must not apply.
    await search({ threshold: 'auto', city: 'Nantes' });

    expect(probeBodies(client)).toHaveLength(0);
    expect(mainBody(client).min_score).toBeUndefined();
  });

  it('the probe mirrors the real query clause (same matching)', async () => {
    const { search, client } = makeSearch([800, 10, 9]);

    await search({ search: 'balade', threshold: 'auto' });

    expect(probeBodies(client)[0].query).toEqual(mainBody(client).query);
  });

  it('config.relevanceMinDrop tunes the elbow sensitivity', async () => {
    // 100 -> 60 is a 0.4 drop: a strict minDrop keeps it, a lenient one cuts.
    const scores = [100, 60, 40, 30, 25];

    const strict = makeSearch(scores, undefined, { relevanceMinDrop: 0.5 });
    await strict.search({ search: 'balade', threshold: 'auto' });
    expect(mainBody(strict.client).min_score).toBeUndefined();

    const lenient = makeSearch(scores, undefined, { relevanceMinDrop: 0.3 });
    await lenient.search({ search: 'balade', threshold: 'auto' });
    expect(mainBody(lenient.client).min_score).toBeGreaterThan(60);
  });

  describe('after-key pagination caches the cutoff in the cursor', () => {
    // A search defaults to sort=score -> ES sort keys are [_score, uid], so a
    // real hit's sort array (and the search_after cursor) has two elements.
    const firstPageHits = {
      total: 5,
      hits: [{ _source: { uid: 1 }, sort: [12.5, 456] }],
    };

    it('first page probes and appends the cutoff to the returned after cursor', async () => {
      const { search, client } = makeSearch([800, 10, 9, 8], firstPageHits);

      const res = await search(
        { search: 'balade', threshold: 'auto' },
        {},
        { useAfterKey: true, includeFields: ['uid'] },
      );

      expect(probeBodies(client)).toHaveLength(1);
      // after = [<sort keys...>, <cutoff>] = sortKeyCount (2) + 1
      expect(res.after).toHaveLength(3);
      expect(Number(res.after[2])).toBeGreaterThan(10);
      expect(Number(res.after[2])).toBeLessThan(800);
    });

    it('subsequent page reuses the cursor cutoff and does NOT probe', async () => {
      const { search, client } = makeSearch([800, 10, 9, 8], firstPageHits);

      await search(
        { search: 'balade', threshold: 'auto' },
        { after: [12.5, 456, 89.4] },
        { useAfterKey: true, includeFields: ['uid'] },
      );

      // No probe on a paginated request.
      expect(probeBodies(client)).toHaveLength(0);

      const main = mainBody(client);
      // Cutoff reused as the floor...
      expect(main.min_score).toBeCloseTo(89.4);
      // ...and stripped back off before reaching ES search_after.
      expect(main.search_after).toEqual([12.5, 456]);
    });

    it('a bare sort-length cursor is NOT mistaken for a cutoff (arity guard)', async () => {
      const { search, client } = makeSearch([800, 10, 9, 8], firstPageHits);

      // Two elements == sort key count, no appended cutoff (e.g. a client-built
      // or includeSort-derived cursor). Must not be stripped.
      await search(
        { search: 'balade', threshold: 'auto' },
        { after: [12.5, 456] },
        { useAfterKey: true, includeFields: ['uid'] },
      );

      const main = mainBody(client);
      // The full cursor reaches ES untouched...
      expect(main.search_after).toEqual([12.5, 456]);
      // ...456 is never treated as a min_score, and we fall back to probing.
      expect(probeBodies(client)).toHaveLength(1);
      expect(main.min_score).toBeGreaterThan(10);
      expect(main.min_score).toBeLessThan(800);
    });
  });
});
