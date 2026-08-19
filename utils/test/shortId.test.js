import unique, { draw, normalize, ALPHABET, LENGTH } from '../shortId.js';

describe('utils.shortId.draw', () => {
  it('is 6 characters of the Crockford alphabet', () => {
    for (let i = 0; i < 200; i += 1) {
      const id = draw();

      expect(id).toHaveLength(LENGTH);
      expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{6}$/);
    }
  });

  // The whole reason for the alphabet: these four never appear, so a human
  // reading an id aloud cannot produce one of them.
  it('never emits I, L, O or U', () => {
    const drawn = Array.from({ length: 2000 }, () => draw()).join('');

    expect(drawn).not.toMatch(/[ILOU]/);
  });

  it('honours a requested length', () => {
    expect(draw(1)).toHaveLength(1);
    expect(draw(32)).toHaveLength(32);
  });

  // A published API: 0, -1, 2.5 and NaN all used to return something rather than
  // complain — and `''` then travelled on as a perfectly good "unique" id, into
  // a URL that ends in a bare slash.
  it.each([0, -1, 2.5, NaN, Infinity, '6', null])(
    'refuses %s as a length',
    (length) => {
      expect(() => draw(length)).toThrow(/positive integer/);
    },
  );

  it('treats an absent length as the default', () => {
    expect(draw(undefined)).toHaveLength(LENGTH);
  });

  it('does not repeat itself over 10 000 draws', () => {
    const seen = new Set();

    for (let i = 0; i < 10000; i += 1) {
      seen.add(draw());
    }

    expect(seen.size).toBeGreaterThan(9990);
  });

  // 32 divides 256, so masking five bits is unbiased by construction — no
  // redraw, and nothing to prove beyond every character being reachable and the
  // spread being flat. Bounds are wide enough that a fair generator fails this
  // about once in 10^8 runs; the modulo bias they exist to catch would be a
  // ~1.6% skew, far outside them.
  it('draws every character about as often as any other', () => {
    const counts = new Map();
    const perChar = 2000;
    const drawn = Array.from(
      { length: ALPHABET.length * perChar },
      () => draw(1),
    ).join('');

    for (const char of drawn) {
      counts.set(char, (counts.get(char) || 0) + 1);
    }

    expect(counts.size).toBe(ALPHABET.length);
    expect(Math.min(...counts.values())).toBeGreaterThan(perChar * 0.8);
    expect(Math.max(...counts.values())).toBeLessThan(perChar * 1.2);
  });
});

describe('utils.shortId.normalize', () => {
  // The other half of the readable-alphabet promise: without this at the route,
  // the alphabet buys nothing.
  it.each([
    ['s5oo0', 'S5000'],
    ['ILO', '110'],
    ['  abc  ', 'ABC'],
    ['o1l', '011'],
  ])('folds %s to %s', (typed, expected) => {
    expect(normalize(typed)).toBe(expected);
  });

  it('returns null for anything that is not a string', () => {
    expect(normalize(42)).toBe(null);
    expect(normalize(null)).toBe(null);
  });

  it('leaves an id it produced untouched', () => {
    const id = draw();

    expect(normalize(id)).toBe(id);
  });
});

describe('utils.shortId (unique, the default export)', () => {
  // Single-character ids against a third of the alphabet: collisions land often
  // enough that the redraw path is genuinely exercised, and ten in a row stays
  // out of reach, so the test does not flake.
  const third = () => new Set(ALPHABET.slice(0, 10).split(''));

  // `unique` grows `taken`, so this deliberately stays well under the 32 values
  // a single character has — the saturation case is its own test below.
  it('never returns an id already taken', () => {
    const taken = third();

    for (let i = 0; i < 15; i += 1) {
      const before = new Set(taken);

      expect(before.has(unique(taken, 1))).toBe(false);
    }
  });

  // The point of returning through `taken`: a caller assigning ids to a batch
  // gets uniqueness across the batch without having to remember to record each
  // draw, which is the mistake that ships duplicates.
  it('remembers what it just handed out', () => {
    const taken = new Set();
    const handed = Array.from({ length: 200 }, () => unique(taken));

    expect(new Set(handed).size).toBe(200);
    expect(taken.size).toBe(200);
  });

  it.each([
    ['a Set', () => new Set(['0'])],
    ['a Map', () => new Map([['0', { some: 'value' }]])],
    ['a plain array', () => ['0']],
  ])('accepts %s and grows it', (_label, make) => {
    const taken = make();
    const id = unique(taken, 6);

    expect(id).not.toBe('0');
    expect(Array.isArray(taken) ? taken.includes(id) : taken.has(id)).toBe(true);
  });

  it('gives up on the facts rather than a diagnosis', () => {
    const taken = new Set(ALPHABET.split(''));

    expect(() => unique(taken, 1)).toThrow(/identifier space is too small/);
  });
});
