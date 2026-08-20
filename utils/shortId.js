// A short, opaque, URL-safe identifier that a human can read out loud.
//
// Built for identifying one occurrence of an event inside that event, where it
// ends up in a URL (`…/events/:slug/t/:timingId`) and gets dictated over the
// phone to support.
//
// ALPHABET — Crockford base32, six characters. An earlier version used base62
// at five, which is the same idea done badly: `0`/`O`/`o` and `1`/`l`/`I` are
// indistinguishable aloud, lookups are exact matches on an ES `keyword`, and
// nothing in the routing normalises anything — so "S5oO0" dictated over the
// phone became "s5oo0" and resolved to nothing, with no way back.
//
// Crockford drops `I`, `L`, `O` and `U` (the first three for looking like
// digits, the last to avoid spelling accidents) and defines a decoding that
// folds case and maps the look-alikes back. Six characters of it hold
// 1 073 741 824 values — MORE than the 916 132 832 of base62 at five — so the
// readable choice costs nothing but one character.
//
// `normalize()` is the other half of that promise: route handlers must run what
// a human typed through it before looking anything up, or the alphabet buys
// nothing.
//
// `globalThis.crypto` rather than `node:crypto`: this package is bundled into
// front-end code, and a bare `import 'node:crypto'` would drag a polyfill into
// those bundles. `getRandomValues` is the one API both sides have had for years
// — since Node 19, hence the `engines` floor in package.json.

export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const LENGTH = 6;

// 32 divides 256, so a byte maps to a character with no bias and no redraw —
// the remainder is exact, where base62 needed rejection sampling to avoid
// favouring its first eight letters.
//
// DERIVED from the alphabet rather than written down beside it: a hard-coded 32
// desynchronises the moment the alphabet changes, and both directions fail
// quietly. Drop one more confusable and `ALPHABET[byte % 32]` is `undefined` for
// `byte % 32 === 31`, so ids contain the literal string 'undefined'; lengthen it
// and the tail of the alphabet is never drawn.
const REMAINDER = ALPHABET.length;

// The exactness above is a property of the alphabet, so it is checked rather
// than trusted — at import, where it costs nothing and cannot be missed.
if (256 % REMAINDER !== 0) {
  throw new Error(
    `shortId: ALPHABET has ${REMAINDER} characters, which does not divide 256 — `
      + 'a byte would map to it with a bias',
  );
}

// `getRandomValues` refuses more than 65 536 bytes with a QuotaExceededError, so
// `assertLength` stops there too. Blessing a length the very next line rejects
// means the caller gets an opaque platform error instead of the message this
// validation exists to give.
const MAX_LENGTH = 65536;

const CROCKFORD_SEPARATORS = /[-\s]/g;

// What Crockford calls decoding: drop the separators a human uses to read an id
// aloud, fold case, and map the characters they confuse for one another back
// onto the ones the alphabet actually uses.
//
// The separators are the half that was missing, and they are not exotic:
// Crockford allows hyphens precisely so an id can be grouped, and "4H7, hyphen,
// M2K" is how it comes back over the phone. Left in, the string missed an exact
// match on an ES `keyword` and the id "resolved to nothing" — the dictation
// failure this alphabet was chosen to prevent.
//
// Returns null for anything that is not an id after normalising, `U` and the
// rest of the excluded characters included. A route handler that passes junk
// through gets one answer to check instead of a lookup that silently finds
// nothing.
export function normalize(id) {
  if (typeof id !== 'string') {
    return null;
  }

  const normalized = id
    .trim()
    .replace(CROCKFORD_SEPARATORS, '')
    .toUpperCase()
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');

  if (!normalized.length) {
    return null;
  }

  for (const character of normalized) {
    if (!ALPHABET.includes(character)) {
      return null;
    }
  }

  return normalized;
}

function assertLength(length) {
  if (!Number.isInteger(length) || length < 1 || length > MAX_LENGTH) {
    throw new Error(
      `shortId: length must be an integer between 1 and ${MAX_LENGTH}, got ${JSON.stringify(length)}`,
    );
  }
}

// The raw draw. Prefer `unique` below whenever the id joins a collection —
// which is nearly always, and is why that one is the default export.
export function draw(length = LENGTH) {
  assertLength(length);

  const bytes = new Uint8Array(length);

  globalThis.crypto.getRandomValues(bytes);

  let out = '';

  for (const byte of bytes) {
    out += ALPHABET[byte % REMAINDER];
  }

  return out;
}

// The form to use when assigning ids to a collection: draws until the id is not
// one the collection already holds, THEN adds it.
//
// Adding it is not a convenience, it is the point. Uniqueness only has to hold
// within one event, but an event may carry hundreds of occurrences, and a
// caller that seeds `taken` from the stored ids and forgets to add each fresh
// draw ships duplicates within its own batch — around one event in 3 300 at 800
// draws, which is never once in testing and regularly in production.
//
// `taken` is a Set or a plain array — a collection OF IDS, and one this function
// may write to. Both halves matter, and the second is why a Map is refused: on a
// `Map<id, timing>` the only honest thing to record is an id with no timing, and
// `taken.set(id, true)` seeded phantom `true` values among real ones, so the
// caller's next `for (const t of taken.values())` died on `true.begin`. An
// earlier note here promised "anything with a `.has()`", which the recording
// step had already made untrue: such a collection threw `taken.add is not a
// function`, and only after a successful draw, so intermittently.
//
// Bind the collection to a variable and reuse it across draws:
//
//   const taken = new Set(timings.map((t) => t.id));
//   for (const timing of timings) { timing.id ??= unique(taken); }
//
// NOT `unique(timings.map((t) => t.id))` inside a loop, which an earlier version
// of this note gave as the example: that rebuilds a throwaway array each time,
// the recording is written to it and dropped, and members drawn earlier in the
// batch are absent from it — shipping duplicates within one batch, which is the
// exact bug this function exists to prevent.
export default function unique(taken, length = LENGTH) {
  assertLength(length);

  const isArray = Array.isArray(taken);

  if (!isArray && !(taken instanceof Set)) {
    throw new Error(
      'shortId: `taken` must be a Set or an array of ids — for a Map, pass '
        + '`new Set(map.keys())`, since recording a draw in it would invent a value',
    );
  }

  const holds = isArray ? (id) => taken.includes(id) : (id) => taken.has(id);
  const remember = isArray ? (id) => taken.push(id) : (id) => taken.add(id);

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const candidate = draw(length);

    if (!holds(candidate)) {
      remember(candidate);
      return candidate;
    }
  }

  // Deliberately a statement of facts, not a diagnosis. The obvious cause at
  // length 6 on a sparse set is a broken random source — but a short length or a
  // saturated set reaches ten collisions honestly, and an operator who reads
  // "the random source is not random" goes hunting for a crypto bug instead of
  // the identifier space they exhausted.
  throw new Error(
    `shortId: 10 draws of length ${length} all collided with a set of `
      + `${isArray ? taken.length : taken.size} — the identifier `
      + 'space is too small for this set, or the random source is broken',
  );
}
