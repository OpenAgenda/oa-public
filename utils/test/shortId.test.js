import shortId, { unique, ALPHABET, LENGTH } from '../shortId.js';

describe('utils.shortId', () => {
  it('is 5 characters of base62', () => {
    for (let i = 0; i < 200; i += 1) {
      const id = shortId();

      expect(id).toHaveLength(LENGTH);
      expect(id).toMatch(/^[A-Za-z0-9]{5}$/);
    }
  });

  it('honours a requested length', () => {
    expect(shortId(1)).toHaveLength(1);
    expect(shortId(32)).toHaveLength(32);
  });

  // Not a uniqueness proof — that is `unique`'s job. This only catches a
  // generator stuck on a constant, which a length check alone would not.
  it('does not repeat itself over 10 000 draws', () => {
    const seen = new Set();

    for (let i = 0; i < 10000; i += 1) {
      seen.add(shortId());
    }

    expect(seen.size).toBeGreaterThan(9990);
  });

  // The reason bytes >= 248 are redrawn: `byte % 62` alone would over-represent
  // the first 8 letters. With 62 000 draws the expected count per letter is
  // 1000, and a 1.6% bias would show as a gap far wider than this window.
  it('draws every letter about as often as any other', () => {
    const counts = new Map();

    for (let i = 0; i < 62000; i += 1) {
      for (const char of shortId(1)) {
        counts.set(char, (counts.get(char) || 0) + 1);
      }
    }

    expect(counts.size).toBe(ALPHABET.length);

    const drawn = [...counts.values()];

    expect(Math.min(...drawn)).toBeGreaterThan(850);
    expect(Math.max(...drawn)).toBeLessThan(1150);
  });
});

describe('utils.shortId.unique', () => {
  // Single-character ids against a sixth of the alphabet: collisions land often
  // enough (~16% a draw) that the redraw path is genuinely exercised, and ten in
  // a row stays out of reach (~1 in 70 million), so the test does not flake.
  const SIXTH = new Set(ALPHABET.slice(0, 10).split(''));

  it('never returns an id already taken', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(SIXTH.has(unique(SIXTH, 1))).toBe(false);
    }
  });

  it('accepts a Map as well as a Set', () => {
    const taken = new Map([...SIXTH].map((c) => [c, { some: 'value' }]));

    for (let i = 0; i < 200; i += 1) {
      expect(taken.has(unique(taken, 1))).toBe(false);
    }
  });

  // `unique(timings.map((t) => t.id))` is the natural call site; answering it
  // with `taken.has is not a function` would be an API inviting the mistake it
  // then punishes.
  it('accepts a plain array', () => {
    const taken = [...SIXTH];

    for (let i = 0; i < 200; i += 1) {
      expect(taken).not.toContain(unique(taken, 1));
    }
  });

  it('gives up loudly rather than looping when nothing is free', () => {
    const taken = new Set(ALPHABET.split(''));

    expect(() => unique(taken, 1)).toThrow(/collisions/);
  });
});
