import resyncUpdated from '../service/lib/resyncUpdated.js';

/**
 * Unit test for the pagination loop in `resyncUpdated`. The previous
 * implementation called `listAgendas(..., 0, 20)` once and silently
 * dropped any 21st-or-later agenda updated in the window. This test
 * exercises a 50-agenda dataset to catch a regression of that bug.
 *
 * Stubs ES rather than booting a real cluster — the loop logic is the
 * only thing under test here. Behaviour against ES is exercised by the
 * existing 01/02 suites via `rebuild()` which shares the same `bulk`
 * call sites. Mock functions are hand-rolled to avoid pulling in
 * `@jest/globals` as a dependency (only `jest` is declared in this
 * package).
 */

const PAGE = 20;

function spy(impl = () => undefined) {
  const calls = [];
  const fn = async (...args) => {
    calls.push(args);
    return impl(...args);
  };
  fn.calls = calls;
  return fn;
}

function makeListAgendas(totalAgendas) {
  const all = Array.from({ length: totalAgendas }, (_value, i) => ({
    id: i + 1,
    uid: i + 1,
  }));

  return spy(async (_query, lastId, limit) => {
    const page = all.filter((a) => a.id > lastId).slice(0, limit);
    return {
      items: page,
      lastId: page.length ? page[page.length - 1].id : -1,
    };
  });
}

function makeStubClient() {
  // Mirrors how ES bulk responds: one item per op-header in the body,
  // keyed by the op name. Headers are single-key entries among the bulk
  // body lines; non-header lines are doc bodies. The delete op is
  // header-only (no body line) — a flat body.length / 2 computation
  // would mis-count delete bulks.
  const opNames = new Set(['index', 'update', 'delete', 'create']);
  return {
    mget: spy(async ({ body: { ids } }) => ({
      docs: ids.map((id) => ({ _id: String(id), found: false })),
    })),
    bulk: spy(async ({ body }) => {
      const headers = body.filter(
        (entry) =>
          Object.keys(entry).length === 1 && opNames.has(Object.keys(entry)[0]),
      );
      return {
        body: {
          items: headers.map((header) => {
            const opName = Object.keys(header)[0];
            return { [opName]: { status: opName === 'index' ? 201 : 200 } };
          }),
        },
      };
    }),
  };
}

describe('resyncUpdated pagination', () => {
  test('loops listAgendas until exhausted (>20 agendas in window)', async () => {
    const totalAgendas = 50;
    const listAgendas = makeListAgendas(totalAgendas);
    const client = makeStubClient();
    const getDetailedAgenda = spy(async (a) => ({
      uid: a.uid,
      // Must be publishable (not private, indexed:true) to flow into the
      // index/update buckets — the in-window orphan sweep routes
      // private/!indexed agendas to delete instead.
      indexed: true,
      private: false,
      // formatAgenda tolerates missing summary, but supply the minimum it
      // touches so it doesn't throw on `agenda.summary?.publishedEvents`.
      summary: { publishedEvents: { current: 0, upcoming: 0, passed: 0 } },
    }));

    const result = await resyncUpdated(
      { client, alias: 'agendas', listAgendas, getDetailedAgenda },
      new Date(0), // ancient `since` so every agenda qualifies
    );

    // Loop must walk every page: 50 agendas / page size 20 → 3 productive
    // calls (20, 20, 10). The final batch's lastId becomes the last seen
    // id, then the next listAgendas call returns lastId: -1 since the
    // page is empty, which short-circuits the loop. So 3 productive +
    // possibly 1 terminator. Assert we reached every agenda.
    expect(listAgendas.calls.length).toBeGreaterThanOrEqual(3);

    // Every agenda in the window must reach the ES bulk write — this is
    // the regression check. Pre-fix this number was capped at PAGE.
    expect(getDetailedAgenda.calls.length).toBe(totalAgendas);
    expect(result.indexed).toBe(totalAgendas);
    expect(result.updated).toBe(0);
    expect(totalAgendas).toBeGreaterThan(PAGE);
  });

  test('routes private/!indexed agendas in ES to bulk delete (in-window orphan sweep)', async () => {
    // Three agendas in the updated window:
    //   1 → publishable (indexed: true), already in ES → update bucket
    //   2 → private, already in ES                     → remove bucket
    //   3 → indexed: false, NOT in ES                  → drop (no-op)
    const detail = {
      1: { uid: 1, indexed: true, private: false },
      2: { uid: 2, indexed: true, private: true },
      3: { uid: 3, indexed: false, private: false },
    };

    const listAgendas = spy(async (_query, lastId) => {
      if (lastId === 0) {
        return {
          items: [
            { id: 1, uid: 1 },
            { id: 2, uid: 2 },
            { id: 3, uid: 3 },
          ],
          lastId: 3,
        };
      }
      return { items: [], lastId: -1 };
    });

    const opNames = new Set(['index', 'update', 'delete', 'create']);
    const client = {
      // Only agendas 1 and 2 currently live in ES; 3 is a soon-to-be-no-op.
      mget: spy(async ({ body: { ids } }) => ({
        docs: ids.map((id) => ({
          _id: String(id),
          found: id === 1 || id === 2,
        })),
      })),
      bulk: spy(async ({ body }) => {
        const headers = body.filter(
          (entry) =>
            Object.keys(entry).length === 1
            && opNames.has(Object.keys(entry)[0]),
        );
        return {
          body: {
            items: headers.map((header) => {
              const opName = Object.keys(header)[0];
              return { [opName]: { status: opName === 'index' ? 201 : 200 } };
            }),
          },
        };
      }),
    };

    const getDetailedAgenda = spy(async (a) => ({
      uid: a.uid,
      ...detail[a.uid],
      summary: { publishedEvents: { current: 0, upcoming: 0, passed: 0 } },
    }));

    const result = await resyncUpdated(
      { client, alias: 'agendas', listAgendas, getDetailedAgenda },
      new Date(0),
    );

    expect(result.updated).toBe(1); // agenda 1
    expect(result.removed).toBe(1); // agenda 2
    expect(result.indexed).toBe(0); // agenda 3 dropped, not added

    // Two bulk operations on the wire: update (for agenda 1) + delete
    // (for agenda 2). Index bucket was empty so no index bulk.
    expect(client.bulk.calls.length).toBe(2);
    const opNamesSeen = client.bulk.calls.map(
      ([{ body }]) => Object.keys(body[0])[0],
    );
    expect(opNamesSeen).toEqual(expect.arrayContaining(['update', 'delete']));
    expect(opNamesSeen).not.toContain('index');
  });

  test('returns zeros and stops cleanly when nothing matches', async () => {
    const listAgendas = spy(async () => ({ items: [], lastId: -1 }));
    const client = makeStubClient();
    const getDetailedAgenda = spy();

    const result = await resyncUpdated({
      client,
      alias: 'agendas',
      listAgendas,
      getDetailedAgenda,
    });

    expect(result).toEqual({ indexed: 0, updated: 0, removed: 0 });
    expect(listAgendas.calls.length).toBe(1);
    expect(getDetailedAgenda.calls.length).toBe(0);
    expect(client.bulk.calls.length).toBe(0);
  });
});
