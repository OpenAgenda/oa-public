import Service from '../index.js';
import config from '../testconfig.js';

// End-to-end guard for the relevance `threshold`: the cutoff is an ES
// `min_score`, applied during document collection, so it must trim the hits,
// the `total`, AND the aggregation counts consistently. (Contrast `post_filter`,
// which runs after aggregations and would leave facet counts untrimmed — the
// regression this test exists to catch.)
describe('02 - event search - functional: relevance threshold facets', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({ index: 'test' });
    } catch (e) {
      // index may not exist yet
    }
  });

  beforeAll(async () => {
    await service('relevanceFacets').rebuild({
      eventsList: async () =>
        (
          await import('./fixtures/02_events.relevance_facets.json', {
            type: 'json',
          })
        ).default,
    });
  });

  const sumCounts = (buckets) =>
    buckets.reduce((n, b) => n + b.eventCount, 0);

  it('threshold=off counts every match in hits, total and facets', async () => {
    const { total, events, aggregations } = await service(
      'relevanceFacets',
    ).search({ search: 'balade', threshold: 'off' }, {}, {
      aggregations: 'addMethods',
    });

    expect(total).toBe(4);
    expect(events).toHaveLength(4);
    expect(sumCounts(aggregations.addMethods)).toBe(4);
  });

  it('threshold=auto trims the long tail from the facet counts too', async () => {
    const off = await service('relevanceFacets').search(
      { search: 'balade', threshold: 'off' },
      {},
      { aggregations: 'addMethods' },
    );
    const auto = await service('relevanceFacets').search(
      { search: 'balade', threshold: 'auto' },
      {},
      { aggregations: 'addMethods' },
    );

    // The cutoff removed weak matches from the result set...
    expect(auto.total).toBeLessThan(off.total);
    expect(auto.events.length).toBe(auto.total);

    // ...and crucially the facet counts reflect the SAME trimmed set: the
    // aggregation total equals the (trimmed) hit total, not the full match set.
    // If min_score did not gate aggregations, this would still sum to 4.
    expect(sumCounts(auto.aggregations.addMethods)).toBe(auto.total);
    expect(sumCounts(auto.aggregations.addMethods)).toBeLessThan(
      sumCounts(off.aggregations.addMethods),
    );
  });
});
