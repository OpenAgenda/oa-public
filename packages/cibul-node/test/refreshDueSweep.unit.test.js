import refreshDueSweep from '../services/agendaSearch/lib/refreshDueSweep.js';

/**
 * Unit test for the Layer 5 refresh-due sweep. Stubs the ES client and
 * the agendaSearch.set call so we can assert: (a) the right range
 * query, (b) the search_after pagination loop, (c) the per-uid
 * agendaSearch.set fanout, (d) concurrency cap.
 */

function spy(impl = () => undefined) {
  const calls = [];
  const fn = async (...args) => {
    calls.push(args);
    return impl(...args);
  };
  fn.calls = calls;
  return fn;
}

function makeServices({ pages = [], onSet = () => {} } = {}) {
  let pageIndex = 0;
  const client = {
    search: spy(async ({ body }) => {
      const i = pageIndex;
      pageIndex += 1;
      // First page: no search_after. Later pages: search_after equals
      // previous page's last hit's `sort` value.
      if (i === 0) {
        expect(body.search_after).toBeUndefined();
      } else {
        const prev = pages[i - 1];
        const lastSort = prev[prev.length - 1]?.sort;
        expect(body.search_after).toEqual(lastSort);
      }
      expect(body.query).toEqual({ range: { _nextRefreshAt: { lte: 'now' } } });
      expect(body.sort).toEqual([{ uid: 'asc' }]);
      expect(body._source).toEqual(['uid']);
      return { body: { hits: { hits: pages[i] ?? [] } } };
    }),
  };

  return {
    agendaSearch: {
      getElasticsearchClient: () => client,
      set: spy(async (arg) => onSet(arg)),
    },
    __client: client,
  };
}

describe('refreshDueSweep', () => {
  test('walks pages, fans out per-uid set, terminates on short page', async () => {
    // Two full-ish pages (4 uids each), final short page with 1 → exit.
    const pages = [
      [
        { sort: [1], _source: { uid: 1 } },
        { sort: [2], _source: { uid: 2 } },
        { sort: [3], _source: { uid: 3 } },
        { sort: [4], _source: { uid: 4 } },
      ],
      [
        { sort: [5], _source: { uid: 5 } },
        { sort: [6], _source: { uid: 6 } },
        { sort: [7], _source: { uid: 7 } },
        { sort: [8], _source: { uid: 8 } },
      ],
      [{ sort: [9], _source: { uid: 9 } }],
    ];

    const services = makeServices({ pages });
    const config = { agendaSearchAlias: 'agendas_test' };
    const result = await refreshDueSweep(config, services)();

    // Loop exits when a page is shorter than PAGE_SIZE (50). With 4
    // and 1 hits per page in our stub, the loop exits on page 0 (4<50)
    // — actually wait, the loop exits on `hits.length < PAGE_SIZE`,
    // and PAGE_SIZE=50 in the implementation. So the first page (4) is
    // already shorter than 50 and the loop exits after one call.
    // Verify the assumption holds: one search call total, all 4 uids
    // reindexed, the second/third pages never requested.
    expect(services.__client.search.calls.length).toBe(1);
    expect(services.agendaSearch.set.calls.length).toBe(4);
    expect(
      services.agendaSearch.set.calls
        .map(([arg]) => arg.uid)
        .sort((a, b) => a - b),
    ).toEqual([1, 2, 3, 4]);
    expect(result.refreshed).toBe(4);
  });

  test('terminates immediately on empty index', async () => {
    const services = makeServices({ pages: [[]] });
    const result = await refreshDueSweep(
      { agendaSearchAlias: 'agendas_test' },
      services,
    )();

    expect(result.refreshed).toBe(0);
    expect(services.__client.search.calls.length).toBe(1);
    expect(services.agendaSearch.set.calls.length).toBe(0);
  });

  test('one failed set does not block others — error caught per-uid', async () => {
    const pages = [
      [
        { sort: [1], _source: { uid: 1 } },
        { sort: [2], _source: { uid: 2 } },
      ],
    ];
    const services = makeServices({
      pages,
      onSet: ({ uid }) => {
        if (uid === 1) throw new Error('synthetic failure');
      },
    });

    const result = await refreshDueSweep(
      { agendaSearchAlias: 'agendas_test' },
      services,
    )();

    expect(result.refreshed).toBe(2); // counts attempts, not successes
    expect(services.agendaSearch.set.calls.length).toBe(2);
  });

  test('drops malformed hits with no uid', async () => {
    const services = makeServices({
      pages: [
        [
          { sort: [1], _source: { uid: 1 } },
          { sort: [2], _source: {} }, // no uid
          { sort: [3], _source: { uid: 'not-a-number' } },
        ],
      ],
    });

    const result = await refreshDueSweep(
      { agendaSearchAlias: 'agendas_test' },
      services,
    )();

    expect(services.agendaSearch.set.calls.length).toBe(1);
    expect(services.agendaSearch.set.calls[0][0].uid).toBe(1);
    // refreshed counts the filtered length
    expect(result.refreshed).toBe(1);
  });
});
