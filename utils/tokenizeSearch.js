// Common French articles/prepositions that add noise as standalone search
// tokens (they match almost everything as a substring while needlessly
// constraining the AND). Kept intentionally short — the exhaustive multilingual
// list lives in event-search; here we only need the high-frequency FR glue words.
const FR_STOPWORDS = new Set([
  'a',
  'au',
  'aux',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
  'ou',
  'sur',
  'un',
  'une',
]);

// Split a free-text search into the tokens matched independently.
// - splits on whitespace, hyphens, apostrophes and light punctuation so that
//   "saint-jean", "l'hôtel" and "hôtel de ville" all tokenize into words;
// - drops empty and single-character tokens;
// - drops common FR stopwords, but falls back to the unfiltered tokens when
//   filtering would empty the list (e.g. a search made only of stopwords).
// Accents/case are intentionally left untouched: a SQL caller compares under a
// collation that folds them (utf8mb3_general_ci).
export default function tokenizeSearch(search) {
  if (typeof search !== 'string') {
    return [];
  }

  const raw = search
    .split(/[\s\-'’"(),.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

  const meaningful = raw.filter(
    (token) => !FR_STOPWORDS.has(token.toLowerCase()),
  );

  return meaningful.length ? meaningful : raw;
}
