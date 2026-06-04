// Dynamic relevance cutoff for the `threshold=auto` search mode.
//
// Given the descending top scores of a syntactic search (gathered by the probe
// query), find the "elbow": the largest relative drop in the score curve,
// anchored to the top score. When that drop clears `minDrop`, everything below
// the elbow is the low-relevance tail, and the boundary is returned as a
// `min_score` floor; otherwise the distribution is too flat to trust a cut and
// 0 (no filtering) is returned.
//
// BM25 scores have no fixed scale across queries, so the cut is computed
// relative to the current query's top score rather than from an absolute value.

export default function computeRelevanceCutoff({
  scores,
  // Minimum normalised drop (fraction of the top score) between two consecutive
  // hits for the gap to count as an elbow rather than gradual decline. The
  // operational default is set where the event-search service is initialised;
  // this is only the fallback for a bare call (e.g. tests). Calibrate on Nantes.
  minDrop = 0.3,
} = {}) {
  const sorted = (scores ?? [])
    .filter((s) => typeof s === 'number' && Number.isFinite(s))
    .sort((a, b) => b - a);

  // Need at least two hits and a positive top score to reason about a drop.
  const top = sorted[0];
  if (sorted.length < 2 || !(top > 0)) {
    return 0;
  }

  // Largest normalised drop between consecutive scores.
  let elbow = -1;
  let maxDrop = 0;
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const drop = (sorted[i] - sorted[i + 1]) / top;
    if (drop > maxDrop) {
      maxDrop = drop;
      elbow = i;
    }
  }

  // Too flat — no clear cliff, keep everything.
  if (maxDrop < minDrop) {
    return 0;
  }

  const high = sorted[elbow];
  const low = sorted[elbow + 1];

  // Place the floor strictly between the two boundary scores so the lower hit
  // (and everything below it) is excluded while the higher hit is kept. The
  // geometric mean sits "in the middle" in log space, which suits BM25's
  // roughly multiplicative spread; fall back when the lower bound is 0.
  return low > 0 ? Math.sqrt(high * low) : high / 2;
}
