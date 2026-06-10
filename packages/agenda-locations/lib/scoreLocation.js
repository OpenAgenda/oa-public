import { distance } from 'fastest-levenshtein';

// Accent-fold + lowercase so "hôtel" and "hotel" compare as equal and a missing
// accent doesn't inflate the edit distance.
export const deburr = (str) =>
  (str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const WORD_SEPARATORS = /[\s\-'’"(),.]+/;

// Relevance bucket for a placename against the search TOKENS (already deburred by
// the caller). Scored per token against the placename's words — not by matching
// the whole query as one contiguous string — so multi-word and reordered queries
// rank correctly, which is exactly what tokenized matching enables. Lower = better.
//   0  placename is exactly the query words
//   1  placename begins with the first token (prefix / autocomplete)
//   2  every token is a whole word of the placename, in any order
//   3  every token is a substring of the placename
//   4  some token isn't in the placename at all (it matched via another column)
export function relevanceBucket(placename, tokens) {
  if (!tokens.length) return 3;

  const name = deburr(placename);
  const words = name.split(WORD_SEPARATORS).filter(Boolean);

  if (words.join(' ') === tokens.join(' ')) return 0;
  if (name.startsWith(tokens[0])) return 1;
  if (tokens.every((token) => words.includes(token))) return 2;
  if (tokens.every((token) => name.includes(token))) return 3;
  return 4;
}

// Short tokens get a stricter edit budget — one edit on a 3-letter word is a
// big change, while two edits on a long word is still recognizably the same.
const maxDistanceFor = (length) => (length <= 4 ? 1 : 2);

// Smallest edit distance between `token` and any single word of `text`.
// Returns 0 when the token is already a substring (no typo to forgive).
export function tokenDistance(token, text) {
  const needle = deburr(token);
  const haystack = deburr(text);

  if (haystack.includes(needle)) {
    return 0;
  }

  let best = Infinity;
  for (const word of haystack.split(WORD_SEPARATORS)) {
    if (!word) continue;
    best = Math.min(best, distance(needle, word));
    if (best === 0) break;
  }
  return best;
}

// A location's searchable `text` fuzzily matches the query when *every* token is
// within its allowed edit distance of some word. Returns the summed distance
// (lower = closer) for ranking, or null when it isn't a match.
export function fuzzyScore(tokens, text) {
  let total = 0;
  for (const token of tokens) {
    const d = tokenDistance(token, text);
    if (d > maxDistanceFor(token.length)) {
      return null;
    }
    total += d;
  }
  return total;
}
