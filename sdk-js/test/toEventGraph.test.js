import { jest } from '@jest/globals';
import { formatInTimeZone } from 'date-fns-tz';
import { toEventGraph, EVENT_GRAPH_MAX_TIMINGS } from '../src/index.js';
import { upcomingTimings } from '../src/schema-org/toEventGraph.js';

function formatDate(date, tz = 'Europe/Paris') {
  return formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

const NOW = Date.parse('2026-12-10T12:00:00+01:00');
const URL = 'https://openagenda.com/fr/theatre/events/42_chers-parents';

// A run of evening performances, 20:00–22:00 Paris time, one per day from
// `firstDay` of December 2026.
const performances = (count, firstDay = 1) =>
  Array.from({ length: count }, (_, i) => {
    const day = new Date(Date.UTC(2026, 11, firstDay + i));
    const date = day.toISOString().slice(0, 10);

    return {
      begin: `${date}T20:00:00+01:00`,
      end: `${date}T22:00:00+01:00`,
    };
  });

const base = {
  title: { fr: 'Chers parents' },
  description: { fr: 'Une comédie.' },
  timezone: 'Europe/Paris',
  attendanceMode: 1,
  status: 1,
  registration: [
    { type: 'link', value: 'https://theatre.example/chers-parents' },
  ],
};

const graphOf = (event, options = {}) =>
  toEventGraph(event, { formatDate, url: URL, now: NOW, ...options });

describe('upcomingTimings', () => {
  it('drops the dates whose end is past, and keeps one in progress', () => {
    const inProgress = {
      begin: '2026-12-10T11:00:00+01:00',
      end: '2026-12-10T13:00:00+01:00',
    };

    expect(
      upcomingTimings(
        [...performances(9), inProgress, ...performances(2, 11)],
        {
          now: NOW,
        },
      ),
    ).toEqual([inProgress, ...performances(2, 11)]);
  });

  it('orders the dates by their instant, not by the order served', () => {
    const [a, b, c] = performances(3, 20);

    expect(upcomingTimings([c, a, b], { now: NOW })).toEqual([a, b, c]);
  });

  it('compares instants across offsets', () => {
    const paris = {
      begin: '2026-12-20T20:00:00+01:00', // 19:00 UTC
      end: '2026-12-20T22:00:00+01:00',
    };
    const reunion = {
      begin: '2026-12-20T21:00:00+04:00', // 17:00 UTC
      end: '2026-12-20T23:00:00+04:00',
    };

    expect(upcomingTimings([paris, reunion], { now: NOW })).toEqual([
      reunion,
      paris,
    ]);
  });

  // `limit` only lowers the cap; anything else is refused rather than read
  // as "nothing" or "everything".
  it.each([
    [NaN],
    ['5'],
    [0],
    [-1],
    [2.5],
    [Infinity],
    [EVENT_GRAPH_MAX_TIMINGS + 1],
  ])('refuses a limit of %p', (limit) => {
    expect(() =>
      upcomingTimings(performances(3, 20), { now: NOW, limit })).toThrow(TypeError);
  });

  it('leaves out a bound a Date cannot hold', () => {
    expect(
      upcomingTimings(
        [
          { begin: 1e17, end: 1e17 },
          { begin: Infinity, end: Infinity },
        ],
        {
          now: NOW,
        },
      ),
    ).toEqual([]);
  });

  it('keeps at most the limit, soonest first', () => {
    const run = performances(30, 11);

    expect(upcomingTimings(run, { now: NOW, limit: 5 })).toEqual(
      run.slice(0, 5),
    );
    expect(upcomingTimings(run, { now: NOW })).toHaveLength(
      EVENT_GRAPH_MAX_TIMINGS,
    );
  });

  // Formatting such a date would throw, and a bound without an offset could
  // never be judged past.
  it('leaves out a date it cannot place in time', () => {
    const [next] = performances(1, 20);

    expect(
      upcomingTimings(
        [
          { begin: 'someday', end: 'later' },
          { begin: next.begin },
          { begin: next.begin, end: null },
          { begin: '2026-12-21T20:00:00', end: '2026-12-21T22:00:00' },
          next,
        ],
        { now: NOW },
      ),
    ).toEqual([next]);
  });

  it('reads Date bounds as well as strings', () => {
    const timing = {
      begin: new Date('2026-12-20T19:00:00Z'),
      end: new Date('2026-12-20T21:00:00Z'),
    };

    expect(upcomingTimings([timing], { now: NOW })).toEqual([timing]);
  });

  it('has nothing to say of a missing list', () => {
    expect(upcomingTimings(undefined, { now: NOW })).toEqual([]);
    expect(upcomingTimings([null], { now: NOW })).toEqual([]);
  });
});

describe('toEventGraph', () => {
  it('emits one Event per date to come, each spanning its own date', () => {
    const graph = graphOf({ ...base, timings: performances(12) });

    expect(graph['@context']).toBe('https://schema.org');
    expect(
      graph['@graph'].map((node) => [node.startDate, node.endDate]),
    ).toEqual(
      [10, 11, 12].map((day) => [
        `2026-12-${day}T20:00:00+01:00`,
        `2026-12-${day}T22:00:00+01:00`,
      ]),
    );
  });

  it('keeps a single long date as one Event', () => {
    const festival = {
      begin: '2026-12-01T10:00:00+01:00',
      end: '2026-12-31T23:00:00+01:00',
    };
    const graph = graphOf({ ...base, timings: [festival] });

    expect(graph['@graph']).toHaveLength(1);
    expect(graph['@graph'][0]).toMatchObject({
      '@type': 'Event',
      startDate: '2026-12-01T10:00:00+01:00',
      endDate: '2026-12-31T23:00:00+01:00',
    });
  });

  it('caps the number of nodes', () => {
    const graph = graphOf({ ...base, timings: performances(40, 11) });

    expect(graph['@graph']).toHaveLength(EVENT_GRAPH_MAX_TIMINGS);
    expect(graph['@graph'].at(-1).startDate).toBe('2026-12-30T20:00:00+01:00');
  });

  it('is null once every date is past', () => {
    expect(graphOf({ ...base, timings: performances(9) })).toBeNull();
    expect(graphOf({ ...base, timings: [] })).toBeNull();
  });

  it('gives every node its own @id under the shared page url', () => {
    const [first, second] = performances(2, 20);
    const graph = graphOf({
      ...base,
      timings: [first, second],
    });

    expect(graph['@graph'].map((node) => node['@id'])).toEqual([
      `${URL}#2026-12-20T19:00:00.000Z`,
      `${URL}#2026-12-21T19:00:00.000Z`,
    ]);
    expect(graph['@graph'].map((node) => node.url)).toEqual([URL, URL]);
  });

  // The read serves an id for some dates and not others: keying on it would
  // mix two schemes on one page.
  it('keys on the begin even when the date has an id', () => {
    const graph = graphOf({
      ...base,
      timings: [{ ...performances(1, 20)[0], id: 'tm-1' }],
    });

    expect(graph['@graph'][0]['@id']).toBe(`${URL}#2026-12-20T19:00:00.000Z`);
  });

  it("can be handed a whole event without crashing on a date it can't read", () => {
    const graph = graphOf({
      ...base,
      timings: [{ begin: 'someday', end: 'later' }, ...performances(1, 20)],
    });

    expect(graph['@graph']).toHaveLength(1);
  });

  // A write refuses overlapping dates, but a date stored before that check
  // may share its begin with another.
  it('never gives two nodes the same @id', () => {
    const [timing] = performances(1, 20);
    const graph = graphOf({
      ...base,
      timings: [timing, { ...timing, end: '2026-12-20T23:00:00+01:00' }],
    });

    expect(graph['@graph'].map((node) => node['@id'])).toEqual([
      `${URL}#2026-12-20T19:00:00.000Z`,
      `${URL}#2026-12-20T19:00:00.000Z/2026-12-20T22:00:00.000Z`,
    ]);
  });

  it('gives three dates on one begin three keys', () => {
    const [timing] = performances(1, 20);
    const graph = graphOf({
      ...base,
      timings: [timing, { ...timing }, { ...timing }],
    });

    expect(new Set(graph['@graph'].map((node) => node['@id'])).size).toBe(3);
  });

  it('takes no options when there is nothing to describe', () => {
    expect(toEventGraph({ ...base, timings: [] })).toBeNull();
  });

  it('leaves @id out when no url is given', () => {
    const graph = toEventGraph(
      { ...base, timings: performances(1, 20) },
      { formatDate, now: NOW },
    );

    expect(graph['@graph'][0]).not.toHaveProperty('@id');
  });

  it('puts the context on the graph, not on each node', () => {
    const graph = graphOf({ ...base, timings: performances(2, 20) });

    graph['@graph'].forEach((node) => {
      expect(node).not.toHaveProperty('@context');
    });
  });

  // The defect this replaces: the event's summary said InStock because some
  // date still sold, and every date inherited it.
  it("reads each date's own availability and booking page", () => {
    const [soldOut, selling] = performances(2, 20);
    const graph = graphOf({
      ...base,
      offersAggregate: {
        availability: 'available',
        pricing: 'paid',
        price: { minCents: 1500, maxCents: 2500, currency: 'EUR' },
        links: [{ provider: 'billetweb', url: 'https://billetweb.fr/e/1' }],
      },
      timings: [
        {
          ...soldOut,
          availability: [
            {
              provider: 'billetweb',
              status: 'soldOut',
              bookingUrl: 'https://billetweb.fr/e/1?date=20',
            },
          ],
        },
        {
          ...selling,
          availability: [
            {
              provider: 'billetweb',
              status: 'available',
              bookingUrl: 'https://billetweb.fr/e/1?date=21',
            },
          ],
        },
      ],
    });

    expect(graph['@graph'].map((node) => node.offers)).toEqual([
      {
        '@type': 'Offer',
        url: 'https://billetweb.fr/e/1?date=20',
        price: 15,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/SoldOut',
      },
      {
        '@type': 'Offer',
        url: 'https://billetweb.fr/e/1?date=21',
        price: 15,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    ]);
  });

  // The summary says "available" because another date still sells: a date
  // with no rows of its own must not inherit it.
  it('does not lend the event summary to a date without rows', () => {
    const [withRows, withoutRows] = performances(2, 20);
    const graph = graphOf({
      ...base,
      offersAggregate: {
        availability: 'available',
        pricing: 'paid',
        price: { minCents: 1500, maxCents: 1500, currency: 'EUR' },
        links: [{ provider: 'billetweb', url: 'https://billetweb.fr/e/1' }],
      },
      timings: [
        {
          ...withRows,
          availability: [{ provider: 'billetweb', status: 'available' }],
        },
        withoutRows,
      ],
    });

    expect(graph['@graph'].map((node) => node.offers)).toEqual([
      {
        '@type': 'Offer',
        url: 'https://billetweb.fr/e/1',
        price: 15,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        url: 'https://billetweb.fr/e/1',
        price: 15,
        priceCurrency: 'EUR',
      },
    ]);
  });

  // An event of one date: its summary IS the date's.
  // A node speaks for its date only (`timing`): its own rows, never the
  // summary. The summary is rolled up from the rows, so a date without rows has
  // nothing to inherit from it anyway; one with rows reads them.
  it("reads a single date's own rows", () => {
    const [date] = performances(1, 20);
    const graph = graphOf({
      ...base,
      offersAggregate: { availability: 'soldOut', pricing: 'paid' },
      timings: [
        {
          ...date,
          availability: [{ provider: 'billetweb', status: 'soldOut' }],
        },
      ],
    });

    expect(graph['@graph'][0].offers.availability).toBe(
      'https://schema.org/SoldOut',
    );
  });

  it('claims nothing for a date without rows, whatever the summary says', () => {
    const graph = graphOf({
      ...base,
      offersAggregate: { availability: 'soldOut', pricing: 'paid' },
      timings: [...performances(1, 1), ...performances(1, 20)],
    });

    expect(graph['@graph']).toHaveLength(1);
    expect(graph['@graph'][0].offers?.availability).toBeUndefined();
  });

  // Full is the event's status, not a summary: it holds for every date.
  it('still marks every date of a full event sold out', () => {
    const graph = graphOf({
      ...base,
      status: 5,
      offersAggregate: { availability: 'available', pricing: 'paid' },
      timings: performances(2, 20),
    });

    expect(graph['@graph'].map((node) => node.offers.availability)).toEqual([
      'https://schema.org/SoldOut',
      'https://schema.org/SoldOut',
    ]);
  });

  it('describes the last date of a postponed event with none left', () => {
    const graph = graphOf({ ...base, status: 4, timings: performances(3) });

    expect(graph['@graph']).toHaveLength(1);
    expect(graph['@graph'][0]).toMatchObject({
      startDate: '2026-12-03T20:00:00+01:00',
      eventStatus: 'https://schema.org/EventPostponed',
    });
  });

  it('offers nothing on any date of a postponed event', () => {
    const graph = graphOf({
      ...base,
      status: 4,
      offersAggregate: { availability: 'available', pricing: 'paid' },
      timings: performances(2, 20).map((timing) => ({
        ...timing,
        availability: [{ provider: 'billetweb', status: 'available' }],
      })),
    });

    graph['@graph'].forEach((node) => {
      expect(node).not.toHaveProperty('offers');
    });
  });

  it('keeps the date that ends last for a postponed event', () => {
    const graph = graphOf({
      ...base,
      status: 4,
      timings: [
        {
          begin: '2026-11-01T10:00:00+01:00',
          end: '2026-11-30T18:00:00+01:00',
        },
        {
          begin: '2026-11-10T10:00:00+01:00',
          end: '2026-11-10T12:00:00+01:00',
        },
      ],
    });

    expect(graph['@graph'][0].endDate).toBe('2026-11-30T18:00:00+01:00');
  });

  it('offers nothing on the date a postponed event keeps', () => {
    const graph = graphOf({
      ...base,
      status: 4,
      timings: performances(3),
    });

    expect(graph['@graph'][0]).not.toHaveProperty('offers');
  });

  // `toInstant` reads a lower-case `z`; a date formatter may not.
  it('formats the instant it judged', () => {
    const graph = graphOf({
      ...base,
      timings: [{ begin: '2026-12-20T19:00:00z', end: '2026-12-20T21:00:00z' }],
    });

    expect(graph['@graph'][0].startDate).toBe('2026-12-20T20:00:00+01:00');
  });

  it('describes the dates still to come of a postponed event, as any other', () => {
    const graph = graphOf({
      ...base,
      status: 4,
      timings: [...performances(1, 1), ...performances(2, 20)],
    });

    expect(graph['@graph'].map((node) => node.startDate)).toEqual([
      '2026-12-20T20:00:00+01:00',
      '2026-12-21T20:00:00+01:00',
    ]);
  });

  it('refuses a `now` a Date cannot hold', () => {
    expect(() =>
      graphOf({ ...base, timings: performances(1, 20) }, { now: Infinity })).toThrow(TypeError);
  });

  it('does not crash on a bound a Date cannot hold', () => {
    expect(
      graphOf({ ...base, timings: [{ begin: 1e17, end: 1e17 }] }),
    ).toBeNull();
  });

  // The clock moves while the nodes are built: a date ending between two
  // reads would be judged past by the later one. `now` absent, the graph
  // still reads it once.
  it('reads the clock once for every node', () => {
    const [first, second] = performances(2, 20);
    const firstEnd = Date.parse(first.end);
    const clock = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(firstEnd - 1)
      .mockReturnValue(firstEnd + 1);

    try {
      const graph = toEventGraph(
        {
          ...base,
          offersAggregate: { availability: 'available', pricing: 'paid' },
          timings: [first, second].map((timing) => ({
            ...timing,
            availability: [{ provider: 'billetweb', status: 'available' }],
          })),
        },
        { formatDate, url: URL },
      );

      expect(graph['@graph']).toHaveLength(2);
      expect(graph['@graph'][0].offers.availability).toBe(
        'https://schema.org/InStock',
      );
    } finally {
      clock.mockRestore();
    }
  });

  it('judges every node against the same instant', () => {
    const inProgress = {
      begin: '2026-12-10T11:00:00+01:00',
      end: '2026-12-10T13:00:00+01:00',
      availability: [{ provider: 'billetweb', status: 'available' }],
    };
    const graph = graphOf({
      ...base,
      offersAggregate: { availability: 'available', pricing: 'paid' },
      timings: [inProgress],
    });

    expect(graph['@graph'][0].offers.availability).toBe(
      'https://schema.org/InStock',
    );
  });
  it('reads `now` as toEventSchema does: a Date works, a string throws', () => {
    const event = { ...base, timings: performances(1, 20) };

    expect(graphOf(event, { now: new Date(NOW) })).not.toBeNull();
    expect(() => graphOf(event, { now: '2026-12-01T00:00:00Z' })).toThrow(
      TypeError,
    );
  });
});
