import Service from '../index.js';
import config from '../testconfig.js';

/*
 * Relevance `threshold` — behavioural reference: `off` (scores visible) vs `auto`,
 * across the three score-distribution shapes that drive the calibration.
 *
 * `auto` sets an ES `min_score` at the "elbow" — the largest relative drop in the
 * query's top scores — but only fires when that drop clears `minDrop`. So the
 * whole behaviour turns on which distributions have a drop above `minDrop`.
 *
 * Calibrated on Nantes Métropole (production, upcoming-only — what the agenda
 * page searches). `topDrop` = largest normalised drop in the top-20:
 *
 *   query            total  topDrop   auto@0.3   auto@0.5
 *   balade photo       62    0.99        1          1      cliff  — genuine noise, trim
 *   Rezé               15    0.43        1         15      shoulder — 0.3 over-cuts, 0.5 keeps
 *   concert           178    0.27      178        178      flat   — never cut
 *   théâtre           104    0.14      104        104      flat
 *
 * The deployed value is `minDrop = 0.5` (env `OA_EVENT_SEARCH_RELEVANCE_MIN_DROP`):
 * it sits in the gap between Rezé's 0.43 (keep) and balade-photo's 0.99 (trim), so
 * it trims only dramatic cliffs and leaves ordinary searches intact. The old
 * default 0.3 over-cut the Rezé-class "shoulder" to a single hit.
 *
 * The fixtures reproduce the three shapes on isolated terms (so each term's IDF is
 * clean), with the scores ES actually produces here:
 *   cliffterm     ~ 4.1, 1.8, 1.7, 1.6   (topDrop ~0.57)  -> balade-photo analog
 *   shoulderterm  ~ 3.4, 1.9, 1.9, 1.8   (topDrop ~0.43)  -> Rezé analog
 *   flatterm      ~ 2.7 x4               (topDrop  0)     -> concert/théâtre analog
 */

const scoreOf = (e) => (e.sort || []).find((x) => x && x.key === 'search')?.value;

async function run(svc, term, threshold) {
  const { total, events } = await svc('relbehavior').search(
    { search: term, threshold },
    { size: 20 },
    { includeSort: true },
  );
  return {
    total,
    scores: events.map(scoreOf).filter((v) => typeof v === 'number'),
  };
}

describe('02 - event search - functional: relevance threshold behaviour', () => {
  // `svc` runs at the deployed/calibrated minDrop=0.5; `svcEager` at the old 0.3,
  // to document why the default was raised. Both query the same indexed set.
  const svc = Service({ ...config, relevanceMinDrop: 0.5 });
  const svcEager = Service({ ...config, relevanceMinDrop: 0.3 });

  beforeAll(async () => {
    try {
      await svc.getConfig().client.indices.delete({ index: 'test' });
    } catch (e) {
      // index may not exist yet
    }
    await svc('relbehavior').rebuild({
      eventsList: async () =>
        (
          await import('./fixtures/02_events.relevance_behavior.json', {
            type: 'json',
          })
        ).default,
    });
  });

  afterAll(async () => {
    await svc.getConfig().client.close();
    await svcEager.getConfig().client.close();
  });

  describe('threshold=off — full distribution, scores visible', () => {
    it('cliff: one dominant hit far above a low tail', async () => {
      const { total, scores } = await run(svc, 'cliffterm', 'off');
      expect(total).toBe(4);
      expect(scores).toHaveLength(4);
      expect([...scores]).toEqual([...scores].sort((a, b) => b - a)); // descending
      const topDrop = (scores[0] - scores[1]) / scores[0];
      expect(topDrop).toBeGreaterThan(0.5); // a genuine cliff
    });

    it('shoulder: one ahead, a close cluster behind (Rezé-like)', async () => {
      const { total, scores } = await run(svc, 'shoulderterm', 'off');
      expect(total).toBe(4);
      const topDrop = (scores[0] - scores[1]) / scores[0];
      // the calibration boundary lives in this band: > old 0.3, < deployed 0.5
      expect(topDrop).toBeGreaterThan(0.3);
      expect(topDrop).toBeLessThan(0.5);
    });

    it('flat: all hits effectively tied', async () => {
      const { total, scores } = await run(svc, 'flatterm', 'off');
      expect(total).toBe(4);
      const spread = (scores[0] - scores[scores.length - 1]) / scores[0];
      expect(spread).toBeLessThan(0.05);
    });
  });

  describe('threshold=auto at the deployed minDrop=0.5', () => {
    it('trims the cliff to its single dominant hit', async () => {
      expect((await run(svc, 'cliffterm', 'auto')).total).toBe(1);
    });

    it('keeps the shoulder intact — does NOT over-cut (the Rezé fix)', async () => {
      expect((await run(svc, 'shoulderterm', 'auto')).total).toBe(4);
    });

    it('leaves the flat distribution untouched', async () => {
      expect((await run(svc, 'flatterm', 'auto')).total).toBe(4);
    });
  });

  describe('why 0.5 and not 0.3 — the old default over-cut the shoulder', () => {
    it('minDrop=0.3 collapses the shoulder to one hit', async () => {
      expect((await run(svcEager, 'shoulderterm', 'auto')).total).toBe(1);
    });

    it('...but even 0.3 leaves a genuinely flat distribution alone', async () => {
      expect((await run(svcEager, 'flatterm', 'auto')).total).toBe(4);
    });
  });
});
