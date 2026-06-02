import formatAgenda from '../service/lib/formatAgenda.js';

/**
 * Threshold-driven `_nextRefreshAt` computation in formatAgenda. The
 * sweep is driven by `_nextRefreshAt <= now`, so the value formatAgenda
 * picks here is what determines when an agenda gets reindexed by the
 * time-rollover path.
 *
 * Constants in formatAgenda: MIN_ABSOLUTE=5, FRACTION=0.05, HORIZON=30 d.
 */

function inputAgenda({ eventsByEndDay = {}, laterDays = 0 } = {}) {
  return {
    uid: 1,
    summary: {
      publishedEvents: {
        current: 0,
        upcoming: 0,
        passed: 0,
        eventsByEndDay,
        laterDays,
      },
    },
  };
}

describe('formatAgenda._nextRefreshAt', () => {
  test('big agenda: trips on the first day cumulative exceeds tau', () => {
    // total = 2 + 14 + 3 + 933 = 952. tau = max(5, 0.05 * 952) = 47.6
    // Days: 30-05 → cum 2 (≤47.6, continue)
    //       31-05 → cum 16 (≤47.6, continue)
    //       01-06 → cum 19 (≤47.6, continue)
    // … cumulative never reaches 47.6 from the in-horizon buckets,
    // because we only have 19 in horizon and 933 in laterDays.
    // → horizon expiry.
    const result = formatAgenda(
      inputAgenda({
        eventsByEndDay: { '2026-05-30': 2, '2026-05-31': 14, '2026-06-01': 3 },
        laterDays: 933,
      }),
    );

    expect(result._nextRefreshAt).toBeTruthy();
    // Horizon expiry is 30 days from "today" (the test-run day). Just
    // assert it's a valid future ISO string > 28 days out (loose to
    // tolerate clock skew between assertion and the formatAgenda call).
    const next = new Date(result._nextRefreshAt);
    const now = new Date();
    const days = (next - now) / (24 * 3600 * 1000);
    expect(days).toBeGreaterThan(28);
    expect(days).toBeLessThanOrEqual(31);
  });

  test('moderately big agenda: trips inside the horizon when cumulative crosses tau', () => {
    // total = 100 + 200 = 300. tau = max(5, 0.05 * 300) = 15
    // Day 30-05 → cum 10 (<15)
    // Day 31-05 → cum 20 (>15) ← trips here
    const result = formatAgenda(
      inputAgenda({
        eventsByEndDay: {
          '2026-05-30': 10,
          '2026-05-31': 10,
          '2026-06-15': 80,
        },
        laterDays: 200,
      }),
    );

    expect(result._nextRefreshAt).toBe('2026-05-31T23:59:59.999Z');
  });

  test('tiny agenda: tau pinned at MIN_ABSOLUTE=5, may never trip in horizon', () => {
    // total = 1. tau = max(5, 0.05*1) = 5.
    // cum never reaches 5 → horizon expiry.
    const result = formatAgenda(
      inputAgenda({
        eventsByEndDay: { '2026-05-31': 1 },
        laterDays: 0,
      }),
    );

    expect(result._nextRefreshAt).toBeTruthy();
    const days = (new Date(result._nextRefreshAt) - new Date()) / (24 * 3600 * 1000);
    expect(days).toBeGreaterThan(28);
  });

  test('small agenda: cumulative trips within horizon', () => {
    // total = 8. tau = max(5, 0.05*8) = 5.
    // Day 30-05 → cum 3 (<5)
    // Day 31-05 → cum 6 (>5) ← trips here
    const result = formatAgenda(
      inputAgenda({
        eventsByEndDay: { '2026-05-30': 3, '2026-05-31': 3, '2026-06-01': 2 },
        laterDays: 0,
      }),
    );

    expect(result._nextRefreshAt).toBe('2026-05-31T23:59:59.999Z');
  });

  test('empty distribution: _nextRefreshAt is null (sweep ignores)', () => {
    const result = formatAgenda(inputAgenda({}));
    expect(result._nextRefreshAt).toBeNull();
  });

  test('treats missing eventsByEndDay / laterDays as empty', () => {
    const result = formatAgenda({
      uid: 1,
      summary: { publishedEvents: { current: 0, upcoming: 0, passed: 0 } },
    });
    expect(result._nextRefreshAt).toBeNull();
  });
});
