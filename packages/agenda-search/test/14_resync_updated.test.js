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
  return {
    mget: spy(async ({ body: { ids } }) => ({
      // Treat every uid as new so resyncUpdated routes every batch through
      // the `index` operation. This lets us assert via `bulk` calls how
      // many agendas were written without faking a pre-existing index.
      docs: ids.map((id) => ({ _id: String(id), found: false })),
    })),
    bulk: spy(async ({ body }) => ({
      // bulk.js measures inserted count off result.body.items.length, with
      // one item per agenda. Our body has 2 entries per agenda (op header
      // + doc), so items.length === body.length / 2.
      body: {
        items: Array.from({ length: body.length / 2 }, () => ({
          index: { status: 201 },
        })),
      },
    })),
  };
}

describe('resyncUpdated pagination', () => {
  test('loops listAgendas until exhausted (>20 agendas in window)', async () => {
    const totalAgendas = 50;
    const listAgendas = makeListAgendas(totalAgendas);
    const client = makeStubClient();
    const getDetailedAgenda = spy(async (a) => ({
      uid: a.uid,
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

    expect(result).toEqual({ indexed: 0, updated: 0 });
    expect(listAgendas.calls.length).toBe(1);
    expect(getDetailedAgenda.calls.length).toBe(0);
    expect(client.bulk.calls.length).toBe(0);
  });
});
