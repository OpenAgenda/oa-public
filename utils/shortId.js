// A short, opaque, URL-safe identifier — 5 characters of base62.
//
// Built for identifying one occurrence of an event inside that event, where it
// has to survive being written into a URL (`…/events/:slug/t/:timingId`) and
// read back by a human over the phone. Hence 5 characters, and hence base62
// rather than hex: 62^5 ≈ 916 million values in the space where hex would give
// about a million.
//
// `globalThis.crypto` rather than `node:crypto`: this package is bundled into
// front-end code, and a bare `import 'node:crypto'` would drag a polyfill into
// those bundles. `getRandomValues` is the one API both sides have had for years.
//
// COLLISIONS ARE THE CALLER'S PROBLEM, and they are not theoretical. Uniqueness
// only has to hold WITHIN one event, but an event may carry up to 800
// occurrences, and by the birthday bound 800 draws out of 62^5 collide about
// once in 2900 events. That is rare enough to never show up in testing and
// common enough to happen in production. A caller assigning ids to a set must
// therefore check the ids it already has and redraw — see `unique` below, which
// does exactly that and is the entry point to prefer.

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const LENGTH = 5;

// 62 does not divide 256, so `byte % 62` would make the first 8 letters of the
// alphabet ~1.6% likelier than the rest. Bytes at or above the largest multiple
// of 62 are redrawn instead, which costs a few extra bytes and keeps the
// distribution flat.
const CEILING = 256 - (256 % ALPHABET.length); // 248

export default function shortId(length = LENGTH) {
  let out = '';

  while (out.length < length) {
    // Ask for what is missing plus a margin, so the redraws below rarely need a
    // second round trip.
    const bytes = new Uint8Array((length - out.length) * 2);

    globalThis.crypto.getRandomValues(bytes);

    for (const byte of bytes) {
      if (byte < CEILING && out.length < length) {
        out += ALPHABET[byte % ALPHABET.length];
      }
    }
  }

  return out;
}

// The form to use when assigning ids to a collection: draws until the id is not
// one the collection already holds.
//
// `taken` may be a Set, a Map keyed by id, or a plain array. The array case is
// not indulgence: the natural call site is `unique(timings.map((t) => t.id))`,
// and accepting only `.has()` would answer it with `taken.has is not a function`
// — an API that invites the mistake it then punishes.
//
// Bounded rather than `while (true)`: at 800 taken ids out of 916 million, ten
// consecutive collisions are impossible short of a broken RNG, and a loop that
// cannot end is worse than an error that names its cause.
export function unique(taken, length = LENGTH) {
  const holds = Array.isArray(taken)
    ? (id) => taken.includes(id)
    : (id) => taken.has(id);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = shortId(length);

    if (!holds(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'shortId: 10 consecutive collisions — the random source is not random',
  );
}
