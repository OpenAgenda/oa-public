import logs from '@openagenda/logs';

const log = logs('relevanceProbe');

// Probe the relevance-score distribution of a syntactic search.
//
// Runs the *same* query clause as the real search (so access-gated fields are
// mirrored) but sorted by relevance (ES default), fetching only the top scores
// with no `_source` and no total tracking — the cheapest way to see the score
// curve the dynamic `threshold=auto` cutoff is computed from.
export default async function probeTopScores(
  { client },
  index,
  query,
  options = {},
) {
  const { size = 20 } = options;

  const res = await client.search({
    index,
    body: {
      query,
      size,
      _source: false,
      track_total_hits: false,
    },
  });

  const scores = (res.body?.hits?.hits ?? [])
    .map((h) => h._score)
    .filter((s) => typeof s === 'number' && Number.isFinite(s));

  log('probed %d scores', scores.length);

  return scores;
}
