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
const REMAINDER = 32;

// What Crockford calls decoding: fold case, and map the characters a human
// confuses for one another back onto the ones the alphabet actually uses.
export function normalize(id) {
  if (typeof id !== 'string') {
    return null;
  }

  return id
    .trim()
    .toUpperCase()
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
}

function assertLength(length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error(
      `shortId: length must be a positive integer, got ${JSON.stringify(length)}`,
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
// `taken` may be a Set, a Map keyed by id, or a plain array: the natural call
// site is `unique(timings.map((t) => t.id))`, and an API that answers that with
// `taken.has is not a function` invites the mistake it then punishes.
export default function unique(taken, length = LENGTH) {
  assertLength(length);

  const holds = Array.isArray(taken)
    ? (id) => taken.includes(id)
    : (id) => taken.has(id);
  const remember = Array.isArray(taken)
    ? (id) => taken.push(id)
    : (id) => (taken instanceof Map ? taken.set(id, true) : taken.add(id));

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
      + `${Array.isArray(taken) ? taken.length : taken.size} — the identifier `
      + 'space is too small for this set, or the random source is broken',
  );
}
