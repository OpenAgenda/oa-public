import computeRelevanceCutoff from '../utils/computeRelevanceCutoff.js';

// Scores that survive a `min_score` floor (ES keeps `_score >= cutoff`).
const kept = (scores, cutoff) => scores.filter((s) => s >= cutoff);

describe('event-search - unit: utils - computeRelevanceCutoff', () => {
  it('cliff distribution (Nantes "balade photo"): cuts the long low tail', () => {
    const scores = [800, 10, 9, 8, 7, 6];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(cutoff).toBeGreaterThan(10);
    expect(cutoff).toBeLessThan(800);
    expect(kept(scores, cutoff)).toEqual([800]);
  });

  it('flat distribution: keeps everything (no cut)', () => {
    const scores = [50, 48, 45, 42, 40];

    expect(computeRelevanceCutoff({ scores })).toBe(0);
    expect(kept(scores, 0)).toEqual(scores);
  });

  it('keeps the whole high cluster, not just the single top hit', () => {
    const scores = [800, 790, 780, 12, 11, 10];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(kept(scores, cutoff)).toEqual([800, 790, 780]);
  });

  it('soft shoulder: cuts at the largest relative drop', () => {
    const scores = [800, 600, 400, 12, 11, 10];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(kept(scores, cutoff)).toEqual([800, 600, 400]);
  });

  it('single dominant hit above a tight cluster', () => {
    const scores = [800, 90, 85, 80];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(kept(scores, cutoff)).toEqual([800]);
  });

  it('always keeps at least the top hit', () => {
    const scores = [800, 1, 1, 1];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(cutoff).toBeLessThan(800);
    expect(kept(scores, cutoff)).toEqual([800]);
  });

  it('returns 0 (no filtering) for fewer than two scores', () => {
    expect(computeRelevanceCutoff({ scores: [] })).toBe(0);
    expect(computeRelevanceCutoff({ scores: [42] })).toBe(0);
    expect(computeRelevanceCutoff({})).toBe(0);
  });

  it('ignores non-finite values defensively', () => {
    // Only one finite score remains -> nothing to compare -> no cut.
    expect(computeRelevanceCutoff({ scores: [NaN, undefined, Infinity, 5] }))
      .toBe(0);
  });

  it('handles a zero lower bound at the elbow', () => {
    const scores = [800, 0, 0];
    const cutoff = computeRelevanceCutoff({ scores });

    expect(cutoff).toBeGreaterThan(0);
    expect(kept(scores, cutoff)).toEqual([800]);
  });

  it('minDrop tunes aggressiveness', () => {
    const scores = [100, 60, 40, 30, 25];

    // Default 0.3: the 100->60 drop (0.4) clears it -> keep only the top.
    expect(kept(scores, computeRelevanceCutoff({ scores }))).toEqual([100]);
    // Stricter 0.5: no drop that large -> keep everything.
    expect(computeRelevanceCutoff({ scores, minDrop: 0.5 })).toBe(0);
  });
});
