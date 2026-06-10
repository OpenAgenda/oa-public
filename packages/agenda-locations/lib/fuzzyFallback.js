import { fuzzyScore } from './scoreLocation.js';

// How many rows the anchor pass may pull before fuzzy-filtering. Keeps the
// fallback bounded on large directories; it only ever runs for searches that
// returned nothing, so the cost is paid on misses, not on every keystroke.
const CANDIDATE_CAP = 300;

// Best-effort typo tolerance for a search that found nothing. Strategy:
//  1. anchor on a token that still has substring matches and pull a bounded
//     candidate set (so we never scan the whole directory);
//  2. keep candidates whose searchable text is within edit distance of *every*
//     query token, ranked by total distance.
// This recalls the common "one token mistyped" case (e.g. "hotl ville"); it is
// deliberately not exhaustive — comprehensive typo recall at scale is the
// Elasticsearch escalation noted in the plan. Returns the full ranked match set
// (bounded by CANDIDATE_CAP); the caller slices the requested page.
export default async function fuzzyFallback(
  runList,
  service,
  { query, nav, options, tokens },
) {
  const byLengthDesc = [...tokens].sort((a, b) => b.length - a.length);

  let candidates = [];
  for (const anchor of byLengthDesc) {
    // eslint-disable-next-line no-await-in-loop
    const res = await runList(
      service,
      { ...query, search: anchor },
      {
        ...nav,
        offset: null,
        limit: CANDIDATE_CAP,
        useAfter: false,
        after: undefined,
      },
      { ...options, total: false, stream: false },
      { skipFuzzyFallback: true },
    );

    candidates = Array.isArray(res) ? res : res?.items ?? [];
    if (candidates.length) {
      break;
    }
  }

  if (!candidates.length) {
    return [];
  }

  return candidates
    .map((item) => ({
      item,
      score: fuzzyScore(
        tokens,
        [item.name, item.address].filter(Boolean).join(' '),
      ),
    }))
    .filter(({ score }) => score !== null)
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}
